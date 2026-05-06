from fastapi import APIRouter, Depends, Header, Request
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
import random
from datetime import datetime, timezone

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
    Step 1: Validate SSO ID, upsert user, and send OTP.
    """
    client_ip = request.client.host
    check_rate_limit(f"otp:{client_ip}", 3, 300)

    try:
        db = get_supabase()
        
        # Check if user exists or needs to be created
        user_query = db.table("users").select("*").eq("sso_id", body.nic_sso_id).execute()
        
        if not user_query.data:
            # For this judicial platform, we assume users are pre-registered or mapped from NIC SSO
            # Here we upsert or handle as needed. Rule: UPSERT on nic_sso_id
            # In a real scenario, we'd fetch full details from NIC SSO API
            user_data = {
                "sso_id": body.nic_sso_id,
                "full_name": f"User {body.nic_sso_id}",  # Placeholder
                "is_active": True,
                "role": "officer" # Default role
            }
            db.table("users").upsert(user_data, on_conflict="sso_id").execute()
            user_query = db.table("users").select("*").eq("sso_id", body.nic_sso_id).execute()

        user = user_query.data[0]
        
        # Generate OTP
        otp = str(random.randint(100000, 999999))
        
        # Store OTP in Supabase (with expiry)
        db.table("otp_store").upsert({
            "sso_id": body.nic_sso_id,
            "otp_code": otp,
            "expires_at": (datetime.now(timezone.utc).replace(microsecond=0) + 
                          timezone.timedelta(minutes=5)).isoformat()
        }, on_conflict="sso_id").execute()

        # Send Email
        if not settings.DEMO_MODE:
            email_service.send_otp(to=user.get("email", "admin@nyayasetu.gov.in"), otp=otp, name=user["full_name"])
        
        await log_audit(db, "otp_requested", user["id"], {"sso_id": body.nic_sso_id})

        response = {"message": "OTP sent"}
        if settings.DEMO_MODE:
            response["otp"] = otp
            
        return response

    except Exception as exc:
        app_logger.error(f"OTP Flow failed: {exc}")
        raise DatabaseConnectionException(details={"error": str(exc)})


@router.post("/login")
async def login(request: Request, body: LoginRequest):
    """
    Step 2: Verify OTP and Role, then issue JWT.
    """
    client_ip = request.client.host
    check_rate_limit(f"login:{client_ip}", 5, 900)

    db = get_supabase()
    
    # 1. Fetch User
    user_query = db.table("users").select("*").eq("sso_id", body.nic_sso_id).execute()
    if not user_query.data:
        raise UserNotFoundException()
    
    user = user_query.data[0]
    
    # 2. Check Account Status
    if not user.get("is_active", True):
        raise AccountInactiveException()
        
    # 3. Check Role
    if user["role"] != body.role:
        raise RoleMismatchException()

    # 4. Verify OTP
    otp_query = db.table("otp_store").select("*").eq("sso_id", body.nic_sso_id).execute()
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
