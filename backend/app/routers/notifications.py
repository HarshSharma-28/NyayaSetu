from fastapi import APIRouter, Header, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone

from app.core.logger import app_logger
from app.core.database import get_supabase
from app.core.security.jwt_handler import verify_token
from app.core.exceptions.auth_exceptions import TokenInvalidException
from app.core.exceptions.notification_exceptions import NotificationNotFoundException
from app.core.exceptions.database_exceptions import DatabaseConnectionException

router = APIRouter(tags=["notifications"])


# ── Dependency ─────────────────────────────────────────────
async def get_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise TokenInvalidException()
    return verify_token(authorization.split(" ")[1])


# ── Endpoints ──────────────────────────────────────────────

@router.get("/")
async def list_notifications(
    is_read: Optional[bool] = Query(None),
    user: dict = Depends(get_user)
):
    """Fetch notifications for the current user."""
    db = get_supabase()
    query = db.table("notifications").select("*").eq("user_id", user["user_id"])
    
    if is_read is not None:
        query = query.eq("is_read", is_read)
        
    result = query.order("created_at", desc=True).execute()
    return result.data


@router.put("/{id}/read")
async def mark_read(id: str, user: dict = Depends(get_user)):
    """Mark a specific notification as read."""
    db = get_supabase()
    
    # Check ownership
    existing = db.table("notifications").select("id").eq("id", id).eq("user_id", user["user_id"]).execute()
    if not existing.data:
        raise NotificationNotFoundException()
        
    db.table("notifications").update({"is_read": True}).eq("id", id).execute()
    return {"message": "Notification marked as read"}


@router.put("/read-all")
async def mark_all_read(user: dict = Depends(get_user)):
    """Bulk update: Mark all own notifications as read."""
    db = get_supabase()
    try:
        db.table("notifications").update({"is_read": True}).eq("user_id", user["user_id"]).eq("is_read", False).execute()
        return {"message": "All notifications marked as read"}
    except Exception as exc:
        app_logger.error(f"Bulk mark read failed: {exc}")
        raise DatabaseConnectionException(message="Failed to update notifications")
