from fastapi import APIRouter, Header, Depends, Query
from typing import Optional
from datetime import datetime, timezone

from app.core.logger import app_logger, audit_logger
from app.core.database import get_supabase
from app.core.security.jwt_handler import verify_token
from app.core.exceptions.auth_exceptions import (
    TokenInvalidException,
    InsufficientPermissionsException,
)
from app.core.exceptions.database_exceptions import (
    RecordNotFoundException,
    DatabaseConnectionException,
)

router = APIRouter(tags=["action_plans"])


# ── Dependency ─────────────────────────────────────────────
async def get_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise TokenInvalidException()
    return verify_token(authorization.split(" ")[1])


# ── Helper ─────────────────────────────────────────────────
async def log_audit(db, action: str, performed_by: str, plan_id: str, details: dict = None):
    try:
        payload = details or {}
        if plan_id:
            payload = {**payload, "plan_id": plan_id}
        audit_entry = {
            "action": action,
            "performed_by": performed_by,
            "new_value": payload,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("audit_log").insert(audit_entry).execute()
    except Exception as exc:
        app_logger.error(f"Audit logging failed: {exc}")


# ── Endpoints ──────────────────────────────────────────────

@router.get("/")
async def list_action_plans(
    dept: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    user: dict = Depends(get_user)
):
    """List action plans. Officers see only their own department."""
    db = get_supabase()
    
    # Base query: verified only (is_verified=true)
    query = db.table("action_plans").select("*, directives(*), cases(*)").eq("is_verified", True)
    
    if user["role"] == "officer":
        query = query.eq("responsible_dept", user.get("dept_id"))
    elif dept:
        query = query.eq("responsible_dept", dept)
        
    if status: query = query.eq("completion_status", status)
    # Priority is often in the directive, so we might need a join or filter on the result
    
    result = query.execute()
    plans = result.data
    
    if priority:
        plans = [p for p in plans if p.get("directives", {}).get("priority") == priority]
        
    return plans


@router.put("/{id}/status")
async def update_plan_status(id: str, body: dict, user: dict = Depends(get_user)):
    """Update action plan status. Officers limited to completion fields."""
    db = get_supabase()
    
    existing = db.table("action_plans").select("*").eq("id", id).execute()
    if not existing.data:
        raise RecordNotFoundException()
    
    current = existing.data[0]
    
    # Permission check
    if user["role"] == "officer":
        # Only allowed to update completion_status and completion_note
        updates = {
            "completion_status": body.get("status"),
            "completion_note": body.get("note")
        }
    elif user["role"] == "admin":
        updates = {k: v for k, v in body.items() if k != "id"}
    else:
        raise InsufficientPermissionsException()

    # If completed, set timestamp
    if updates.get("completion_status") == "completed":
        updates["completed_at"] = datetime.now(timezone.utc).isoformat()

    result = db.table("action_plans").update(updates).eq("id", id).execute()
    
    await log_audit(db, "plan_status_updated", user["user_id"], id, updates)
    
    # Notify Admin on completion
    if updates.get("completion_status") == "completed":
        # 1. Fetch case details to get case number
        case_id = current.get("case_id")
        case_num = "Unknown Case"
        if case_id:
            c_res = db.table("cases").select("case_number").eq("id", case_id).execute()
            if c_res.data:
                case_num = c_res.data[0]["case_number"]

        # 2. Find all admin users to notify them
        admins_res = db.table("users").select("id").eq("role", "admin").execute()
        
        for admin in admins_res.data:
            notif_data = {
                "user_id": admin["id"],
                "case_id": case_id,
                "type": "action_required",
                "title": "Action Plan Completed",
                "message": f"Case {case_num}: Task has been marked as COMPLETED by the officer.",
                "is_read": False
            }
            db.table("notifications").insert(notif_data).execute()

    return result.data[0]


@router.delete("/{id}")
async def delete_plan(id: str, user: dict = Depends(get_user)):
    """Soft delete action plan. Admin only."""
    if user["role"] != "admin":
        raise InsufficientPermissionsException()

    db = get_supabase()
    db.table("action_plans").update({
        "is_verified": False,
        "completion_note": "Soft deleted by admin"
    }).eq("id", id).execute()
    
    await log_audit(db, "plan_deleted", user["user_id"], id)
    
    return {"message": "Action plan removed"}
