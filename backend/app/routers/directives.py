from fastapi import APIRouter, Header, Depends
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
    DirectiveUpdateNotAllowedException,
)
from app.core.exceptions.database_exceptions import DatabaseConnectionException

router = APIRouter(tags=["directives"])


# ── Dependency ─────────────────────────────────────────────
async def get_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise TokenInvalidException()
    return verify_token(authorization.split(" ")[1])


# ── Helper ─────────────────────────────────────────────────
async def log_audit(db, action: str, performed_by: str, directive_id: str, old: dict = None, new: dict = None):
    try:
        audit_entry = {
            "action": action,
            "performed_by": performed_by,
            "directive_id": directive_id,
            "old_value": old,
            "new_value": new,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("audit_log").insert(audit_entry).execute()
    except Exception as exc:
        app_logger.error(f"Audit logging failed: {exc}")


# ── Endpoints ──────────────────────────────────────────────

@router.get("/case/{case_id}")
async def get_case_directives(case_id: str, user: dict = Depends(get_user)):
    """Fetch all directives for a case. Officers only see their own department's."""
    db = get_supabase()
    query = db.table("directives").select("*").eq("case_id", case_id)
    
    if user["role"] == "officer":
        query = query.eq("assigned_department", user.get("dept_id"))
        
    result = query.execute()
    return result.data


@router.put("/{directive_id}")
async def update_directive(directive_id: str, body: dict, user: dict = Depends(get_user)):
    """Update directive fields. Reviewer/Admin only."""
    if user["role"] not in ("admin", "reviewer"):
        raise InsufficientPermissionsException()

    db = get_supabase()
    
    # 1. Fetch current
    existing = db.table("directives").select("*").eq("id", directive_id).execute()
    if not existing.data:
        raise DirectiveNotFoundException()
    
    current = existing.data[0]
    
    # 2. Guard: Cannot update if already rejected (per prompt: "Raise if rejected")
    # Actually prompt says: "Raise DirectiveUpdateNotAllowedException if rejected"
    if current.get("status") == "rejected":
        raise DirectiveUpdateNotAllowedException(message="Cannot update a rejected directive")

    # 3. Perform update
    updates = {k: v for k, v in body.items() if k != "id"}
    result = db.table("directives").update(updates).eq("id", directive_id).execute()
    
    # 4. Audit Log
    await log_audit(db, "directive_updated", user["user_id"], directive_id, current, updates)
    
    return result.data[0]
