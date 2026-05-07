from fastapi import APIRouter, Depends, Header, Request
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
import random
from datetime import datetime, timezone, timedelta

from app.core.config import settings
from app.core.logger import app_logger, audit_logger
from app.core.database import get_supabase
from app.core.security.jwt_handler import create_access_token, verify_token, blacklist_token
from app.core.security.rate_limiter import check_rate_limit
from app.core.exceptions.auth_exceptions import (
    InvalidCredentialsException,
    InvalidOTPException,
    OTPExpiredException,
    UserNotFoundException,
    AccountInactiveException,
    TokenInvalidException,
    RoleMismatchException,
)
from app.core.exceptions.database_exceptions import DatabaseConnectionException
from app.modules.email.mailer import email_service

router = APIRouter(tags=["auth"])


# ── Schemas ────────────────────────────────────────────────
class SendOTPRequest(BaseModel):
    nic_sso_id: str = Field(..., description="Unique NIC SSO ID")


class LoginRequest(BaseModel):
    nic_sso_id: str
    password: str
    role: str
    otp: str


# ── Helper ─────────────────────────────────────────────────
async def log_audit(db, action: str, performed_by: str, details: dict = None):
    """Helper to log to audit_log table and internal logger."""
    try:
        audit_entry = {
            "action": action,
            "performed_by": performed_by,
            "details": details or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("audit_log").insert(audit_entry).execute()
        audit_logger.info(f"action={action} | performed_by={performed_by} | details={details}")
    except Exception as exc:
        app_logger.error(f"Audit logging failed: {exc}")


# ── Endpoints ──────────────────────────────────────────────

@router.post("/send-otp")
async def send_otp(request: Request, body: SendOTPRequest):
    """
    Step 1: Validate SSO ID, Auto-Create user if missing, and send OTP.
    """
    client_ip = request.client.host

    try:
        db = get_supabase()
        
        # 1. Check if user exists, if not, AUTO-CREATE for testing
        user_query = db.table("users").select("*").eq("nic_sso_id", body.nic_sso_id).execute()
        
        if not user_query.data:
            app_logger.info(f"Auto-creating user for ID: {body.nic_sso_id}")
            user_data = {
                "nic_sso_id": body.nic_sso_id,
                "employee_id": f"EMP-{body.nic_sso_id}",
                "full_name": f"User {body.nic_sso_id}",
                "email": f"{body.nic_sso_id}@example.gov.in", # Mock email for demo
                "is_active": True,
                "role": "officer" # Default role, can be changed in login
            }
            db.table("users").insert(user_data).execute()
            user_query = db.table("users").select("*").eq("nic_sso_id", body.nic_sso_id).execute()

        user = user_query.data[0]
        
        # 2. Generate OTP
        otp = str(random.randint(100000, 999999))
        
        # 3. Store OTP (Upsert to replace old ones)
        db.table("otp_store").upsert({
            "nic_sso_id": body.nic_sso_id,
            "otp_code": otp,
            "expires_at": (datetime.now(timezone.utc) + timedelta(minutes=5)).isoformat()
        }, on_conflict="nic_sso_id").execute()

        # 4. Mock sending (Always log to console for easy testing)
        app_logger.info(f"🔑 OTP for {body.nic_sso_id}: {otp}")
        
        if not settings.DEMO_MODE:
            try:
                email_service.send_otp(to=user.get("email"), otp=otp, name=user["full_name"])
            except Exception as e:
                app_logger.warning(f"Email send failed (but OTP is valid): {e}")
        
        await log_audit(db, "otp_requested", user["id"], {"sso_id": body.nic_sso_id, "otp_code": otp})

        return {"message": "OTP sent", "debug_otp": otp} # Returning OTP in response for even easier testing

    except Exception as exc:
        app_logger.error(f"OTP Flow failed: {exc}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/login")
async def login(request: Request, body: LoginRequest):
    """
    Step 2: Verify OTP and Role, then issue JWT.
    """
    client_ip = request.client.host
    # check_rate_limit(f"login:{client_ip}", 50, 900) # Disabled for demo

    db = get_supabase()
    
    # 1. Fetch User
    user_query = db.table("users").select("*").eq("nic_sso_id", body.nic_sso_id).execute()
    if not user_query.data:
        raise UserNotFoundException()
    
    user = user_query.data[0]
    
    # 2. Check Account Status
    if not user.get("is_active", True):
        raise AccountInactiveException()
        
    # 3. Check Role
    if user["role"] != body.role:
        if settings.DEMO_MODE:
            db.table("users").update({"role": body.role}).eq("id", user["id"]).execute()
            user["role"] = body.role
        else:
            raise RoleMismatchException()

    # 4. Verify OTP
    otp_query = db.table("otp_store").select("*").eq("nic_sso_id", body.nic_sso_id).execute()
    if not otp_query.data:
        raise InvalidOTPException()
        
    otp_record = otp_query.data[0]
    
    # Check expiry
    expires_at = datetime.fromisoformat(otp_record["expires_at"].replace("Z", "+00:00"))
    if datetime.now(timezone.utc) > expires_at:
        raise OTPExpiredException()
        
    if otp_record["otp_code"] != body.otp:
        raise InvalidOTPException()

    # 5. Success - Generate Token
    token = create_access_token({
        "user_id": user["id"],
        "role": user["role"],
        "dept_id": user.get("department_id")
    })
    
    # 6. Update Last Login
    db.table("users").update({"last_login": datetime.now(timezone.utc).isoformat()}).eq("id", user["id"]).execute()
    
    # 7. Audit Log
    await log_audit(db, "login", user["id"], {"role": body.role})

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["full_name"],
            "role": user["role"],
            "department": user.get("department_id")
        }
    }


@router.post("/logout")
async def logout(authorization: str = Header(...)):
    """Invalidate token and log out."""
    if not authorization.startswith("Bearer "):
        raise TokenInvalidException()
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    db = get_supabase()
    blacklist_token(token)
    
    await log_audit(db, "logout", payload["user_id"])
    
    return {"message": "Logged out successfully"}


@router.get("/me")
async def get_me(authorization: str = Header(...)):
    """Fetch current user profile."""
    if not authorization.startswith("Bearer "):
        raise TokenInvalidException()
    
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    
    db = get_supabase()
    user_query = db.table("users").select("*").eq("id", payload["user_id"]).execute()
    
    if not user_query.data:
        raise UserNotFoundException()
        
    user = user_query.data[0]
    
    # Exclude sensitive/deleted info
    profile = {k: v for k, v in user.items() if k not in ("password", "deleted_at")}
    return profile
