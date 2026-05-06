from fastapi import APIRouter, Header, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import time

from app.core.logger import app_logger
from app.core.database import get_supabase
from app.core.security.jwt_handler import verify_token
from app.core.exceptions.auth_exceptions import TokenInvalidException
from app.core.exceptions.database_exceptions import DatabaseConnectionException

router = APIRouter(tags=["dashboard"])

# ── Simple In-Memory Cache ─────────────────────────────────
_stats_cache = {} # {user_id: (timestamp, data)}
CACHE_TTL = 30 # seconds


# ── Dependency ─────────────────────────────────────────────
async def get_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise TokenInvalidException()
    return verify_token(authorization.split(" ")[1])


# ── Endpoints ──────────────────────────────────────────────

@router.get("/stats")
async def get_stats(user: dict = Depends(get_user)):
    """Fetch dashboard statistics. Cached for 30s."""
    user_id = user["user_id"]
    now = time.time()
    
    if user_id in _stats_cache:
        ts, data = _stats_cache[user_id]
        if now - ts < CACHE_TTL:
            return data

    db = get_supabase()
    try:
        # Call Supabase RPC for aggregated stats
        result = db.rpc("get_dashboard_stats", {"p_user_id": user_id}).execute()
        stats = result.data
        
        _stats_cache[user_id] = (now, stats)
        return stats
    except Exception as exc:
        app_logger.error(f"Failed to fetch stats: {exc}")
        # Fallback to empty stats if RPC fails or not defined yet
        return {"total_cases": 0, "pending_directives": 0, "contempt_risk_count": 0}


@router.get("/actions")
async def get_active_actions(
    dept: Optional[str] = None,
    priority: Optional[str] = None,
    user: dict = Depends(get_user)
):
    """Fetch active (uncompleted) action plans sorted by due date."""
    db = get_supabase()
    query = db.table("action_plans").select("*, directives(*), cases(*)").eq("is_verified", True).neq("completion_status", "completed")
    
    if user["role"] == "officer":
        query = query.eq("assigned_department", user.get("dept_id"))
    elif dept:
        query = query.eq("assigned_department", dept)
        
    result = query.order("deadline", desc=False).execute()
    actions = result.data
    
    if priority:
        actions = [a for a in actions if a.get("directives", {}).get("priority") == priority]
        
    return actions


@router.get("/contempt-risk")
async def get_contempt_risk(user: dict = Depends(get_user)):
    """Fetch cases at high risk of contempt (deadline passed or near)."""
    db = get_supabase()
    try:
        result = db.rpc("check_contempt_risk", {"p_user_id": user["user_id"]}).execute()
        return result.data
    except Exception as exc:
        app_logger.error(f"Contempt risk check failed: {exc}")
        return []


@router.get("/audit-log")
async def get_audit_feed(user: dict = Depends(get_user)):
    """Fetch recent audit log entries. Admin sees all, others see own."""
    db = get_supabase()
    query = db.table("audit_log").select("*, users(full_name)")
    
    if user["role"] != "admin":
        query = query.eq("performed_by", user["user_id"])
        
    result = query.order("created_at", desc=True).limit(50).execute()
    return result.data
