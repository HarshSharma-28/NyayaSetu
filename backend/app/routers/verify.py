from fastapi import APIRouter, Header, Depends, Body
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

from app.core.logger import app_logger, audit_logger
from app.core.database import get_supabase
from app.core.security.jwt_handler import verify_token
from app.core.exceptions.auth_exceptions import (
    TokenInvalidException,
    InsufficientPermissionsException,
)
from app.core.exceptions.directive_exceptions import (
    DirectiveNotFoundException,
    DirectiveAlreadyVerifiedException,
    DirectiveRejectionReasonMissingException,
)
from app.core.exceptions.database_exceptions import DatabaseConnectionException
from app.modules.email.mailer import email_service

router = APIRouter(tags=["verification"])


# ── Dependency ─────────────────────────────────────────────
async def get_reviewer(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise TokenInvalidException()
    payload = verify_token(authorization.split(" ")[1])
    if payload["role"] not in ("admin", "reviewer"):
        raise InsufficientPermissionsException()
    return payload


# ── Helper ─────────────────────────────────────────────────
async def log_audit(db, action: str, performed_by: str, directive_id: str, details: dict = None):
    try:
        audit_entry = {
            "action": action,
            "performed_by": performed_by,
            "directive_id": directive_id,
            "details": details or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("audit_log").insert(audit_entry).execute()
    except Exception as exc:
        app_logger.error(f"Audit logging failed: {exc}")


# ── Endpoints ──────────────────────────────────────────────

@router.post("/{directive_id}/approve")
async def approve_directive(directive_id: str, user: dict = Depends(get_reviewer)):
    """Approve a directive and generate an action plan."""
    db = get_supabase()
    
    # 1. Fetch directive
    existing = db.table("directives").select("*, cases(case_number)").eq("id", directive_id).execute()
    if not existing.data:
        raise DirectiveNotFoundException()
    
    directive = existing.data[0]
    if directive.get("status") == "approved":
        raise DirectiveAlreadyVerifiedException()

    try:
        # 2. Sequential "Transaction"
        # Update Directive
        now = datetime.now(timezone.utc).isoformat()
        db.table("directives").update({
            "status": "approved",
            "verified_by": user["user_id"],
            "verified_at": now
        }).eq("id", directive_id).execute()

        # Create Action Plan
        plan_data = {
            "directive_id": directive_id,
            "case_id": directive["case_id"],
            "assigned_department": directive["assigned_department"],
            "deadline": directive["compliance_deadline"],
            "status": "pending",
            "created_at": now
        }
        plan_res = db.table("action_plans").insert(plan_data).execute()
        plan_id = plan_res.data[0]["id"]

        # Log Audit
        await log_audit(db, "directive_approved", user["user_id"], directive_id, {"plan_id": plan_id})

        # Insert Notification for Dept Officer
        # Fetch officer email (Mocking for logic)
        officer_query = db.table("users").select("email, full_name").eq("department_id", directive["assigned_department"]).execute()
        
        if officer_query.data:
            officer = officer_query.data[0]
            notif_data = {
                "user_id": officer.get("id"), # Assuming we have officer id
                "title": "New Directive Assigned",
                "message": f"Action plan created for Case {directive['cases']['case_number']}",
                "is_read": False
            }
            # db.table("notifications").insert(notif_data).execute()
            
            # Send Email
            email_service.send_deadline_alert(
                to=officer["email"],
                case_number=directive["cases"]["case_number"],
                due_date=directive["compliance_deadline"],
                days_left=30 # Placeholder
            )

        return {"message": "Directive approved and action plan generated", "action_plan_id": plan_id}

    except Exception as exc:
        app_logger.error(f"Approval failed: {exc}")
        raise DatabaseConnectionException(message="Failed to finalize approval")


@router.post("/{directive_id}/edit")
async def edit_directive(directive_id: str, body: dict = Body(...), user: dict = Depends(get_reviewer)):
    """Edit directive fields and mark as edited."""
    db = get_supabase()
    
    existing = db.table("directives").select("*").eq("id", directive_id).execute()
    if not existing.data:
        raise DirectiveNotFoundException()
    
    old_data = existing.data[0]
    
    updates = {**body, "status": "edited"}
    result = db.table("directives").update(updates).eq("id", directive_id).execute()
    
    # Update action plan if exists
    db.table("action_plans").update({"deadline": updates.get("compliance_deadline")}).eq("directive_id", directive_id).execute()
    
    await log_audit(db, "directive_edited", user["user_id"], directive_id, {
        "old": {k: old_data.get(k) for k in updates.keys()},
        "new": updates
    })
    
    return {"message": "Directive updated", "directive": result.data[0]}


@router.post("/{directive_id}/reject")
async def reject_directive(directive_id: str, reason: str = Body(..., embed=True), user: dict = Depends(get_reviewer)):
    """Reject a directive with a mandatory reason."""
    if not reason.strip():
        raise DirectiveRejectionReasonMissingException()

    db = get_supabase()
    db.table("directives").update({
        "status": "rejected",
        "reviewer_note": reason
    }).eq("id", directive_id).execute()
    
    await log_audit(db, "directive_rejected", user["user_id"], directive_id, {"reason": reason})
    
    return {"message": "Directive rejected"}


@router.get("/queue")
async def get_verification_queue(user: dict = Depends(get_reviewer)):
    """Reviewer queue: pending directives sorted by priority and due date."""
    db = get_supabase()
    # Priority sorting logic: CRITICAL first, then due_date ASC
    # In SQL: ORDER BY CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 ... END, compliance_deadline ASC
    # Postgrest doesn't support complex case-order via URL easily, we'll sort in python or use a simple order
    
    result = db.table("directives").select("*, cases(*)").eq("status", "pending").execute()
    
    queue = result.data
    # Custom sort in Python for precision
    priority_map = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    queue.sort(key=lambda x: (priority_map.get(x["priority"].lower(), 99), x["compliance_deadline"] or "9999"))
    
    return queue
