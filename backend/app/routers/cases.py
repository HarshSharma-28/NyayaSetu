from fastapi import APIRouter, Depends, Header, UploadFile, File, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

from app.core.config import settings
from app.core.logger import app_logger, audit_logger
from app.core.database import get_supabase
from app.core.security.jwt_handler import verify_token
from app.core.security.input_sanitizer import sanitize_string
from app.core.exceptions.auth_exceptions import (
    TokenInvalidException,
    InsufficientPermissionsException,
)
from app.core.exceptions.case_exceptions import (
    CaseNotFoundException,
    CaseAlreadyExistsException,
    CaseDeletedSoftlyException,
    InvalidCaseStatusTransitionException,
)
from app.core.exceptions.pdf_exceptions import (
    InvalidFileTypeException,
    PDFTooLargeException,
)
from app.core.exceptions.database_exceptions import DatabaseConnectionException

# Module imports (assuming these exist in the project)
# Module imports
from app.modules.pdf_processor.extractor import PDFProcessor
from app.modules.ai_orchestrator.gemini_client import GeminiOrchestrator
from app.modules.action_planner.timeline_resolver import TimelineResolver
from app.modules.action_planner.dept_router import DepartmentRouter

router = APIRouter(tags=["cases"])


# ── Dependency ─────────────────────────────────────────────
async def get_user(authorization: str = Header(...)) -> dict:
    if not authorization.startswith("Bearer "):
        raise TokenInvalidException()
    return verify_token(authorization.split(" ")[1])


# ── Helper ─────────────────────────────────────────────────
async def log_audit(db, action: str, performed_by: str, case_id: str = None, details: dict = None):
    try:
        audit_entry = {
            "action": action,
            "performed_by": performed_by,
            "case_id": case_id,
            "details": details or {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        db.table("audit_log").insert(audit_entry).execute()
    except Exception as exc:
        app_logger.error(f"Audit logging failed: {exc}")


# ── Endpoints ──────────────────────────────────────────────

@router.post("/upload")
async def upload_case_pdf(
    case_number: str,
    file: UploadFile = File(...),
    user: dict = Depends(get_user)
):
    """
    Upload and process a judgment PDF. Admin only.
    Runs AI extraction and routes directives to departments.
    """
    if user["role"] != "admin":
        raise InsufficientPermissionsException()

    # 1. Validations
    if not file.filename.endswith(".pdf"):
        raise InvalidFileTypeException()
    
    file_content = await file.read()
    if len(file_content) > settings.PDF_MAX_SIZE_MB * 1024 * 1024:
        raise PDFTooLargeException()

    db = get_supabase()
    
    # 2. Duplicate Check
    existing = db.table("cases").select("id").eq("case_number", case_number).execute()
    if existing.data:
        raise CaseAlreadyExistsException(details={"existing_case_id": existing.data[0]["id"]})

    # 3. Storage Upload
    file_path = f"{uuid.uuid4()}.pdf"
    try:
        db.storage.from_(settings.PDF_BUCKET).upload(file_path, file_content)
    except Exception as exc:
        app_logger.error(f"File upload failed: {exc}")
        raise DatabaseConnectionException(message="Failed to upload PDF to storage")

    # 4. Real Processing Logic
    try:
        # Initialize processors
        pdf_proc = PDFProcessor()
        ai_orch = GeminiOrchestrator()
        timer = TimelineResolver()
        router_logic = DepartmentRouter()

        # Step 1: Extract Text
        extraction = pdf_proc.extract_text(file_content)
        
        # Step 2: AI Analysis (Judgment DNA)
        judgment_dna = await ai_orch.extract_judgment_dna(
            extraction["full_text"], 
            order_date=datetime.now().strftime("%Y-%m-%d") # Fallback if not found
        )
        
        # Step 3: Action Planning & Routing
        directives_processed = []
        for d in judgment_dna.get("directives", []):
            deadline = timer.resolve_deadline(d.get("timeline_raw"))
            dept = router_logic.route_directive(d.get("raw_text"), d.get("department_hint"))
            
            directives_processed.append({
                "directive_text": d.get("raw_text"),
                "priority": d.get("priority", "medium").lower(),
                "assigned_department": dept,
                "compliance_deadline": deadline.isoformat() if deadline else None,
                "confidence_score": d.get("confidence_score", 0.0),
                "source_location": d.get("source_location", "")
            })

        # 5. Atomic-like Insert
        # Insert Case
        case_data = {
            "case_number": case_number,
            "status": "extracted",
            "pdf_url": file_path,
            "uploaded_by": user["user_id"],
            "petitioner": judgment_dna.get("petitioner"),
            "respondent": ", ".join(judgment_dna.get("respondents", [])),
            "court_name": judgment_dna.get("court_name"),
            "judgment_date": judgment_dna.get("date_of_order"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        case_res = db.table("cases").insert(case_data).execute()
        new_case_id = case_res.data[0]["id"]

        # Insert Directives (Bulk)
        for d in directives_processed:
            d["case_id"] = new_case_id
        db.table("directives").insert(directives_processed).execute()

        # Audit Log
        await log_audit(db, "case_processed_ai", user["user_id"], new_case_id, {"case_number": case_number})

        return {
            "case_id": new_case_id,
            "case_number": case_number,
            "directive_count": len(directives_processed),
            "status": "extracted",
            "ai_metadata": {
                "court": judgment_dna.get("court_name"),
                "date": judgment_dna.get("date_of_order")
            }
        }

    except Exception as exc:
        app_logger.error(f"Processing failed: {exc}")
        # Rollback storage
        db.storage.from_(settings.PDF_BUCKET).remove([file_path])
        raise DatabaseConnectionException(message=f"Processing error: {str(exc)}")



@router.get("/")
async def list_cases(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    dept: Optional[str] = None,
    court: Optional[str] = None,
    search: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort: str = Query("created_at"),
    order: str = Query("desc"),
    user: dict = Depends(get_user)
):
    """List cases with role-based visibility and filtering."""
    db = get_supabase()
    query = db.table("cases").select("*", count="exact").is_("deleted_at", "null")

    # Visibility constraints
    if user["role"] == "officer":
        # Officers only see cases with their dept's directives
        # This requires a join or a subquery. 
        # In Supabase/Postgrest we can use .select("*, directives!inner(*)")
        query = query.select("*, directives!inner(*)").eq("directives.assigned_department", user["dept_id"])
    
    # Filters
    if status: query = query.eq("status", status)
    if priority: query = query.eq("priority", priority)
    if dept: query = query.eq("department", dept)
    if court: query = query.eq("court_name", court)
    
    if search:
        safe_search = sanitize_string(search)
        query = query.or_(f"case_number.ilike.%{safe_search}%,petitioner.ilike.%{safe_search}%")

    # Pagination & Sort
    offset = (page - 1) * limit
    query = query.order(sort, desc=(order == "desc"))
    result = query.range(offset, offset + limit - 1).execute()

    return {
        "cases": result.data,
        "total": result.count,
        "page": page
    }


@router.get("/{case_id}")
async def get_case_details(case_id: str, user: dict = Depends(get_user)):
    """Fetch full case details including directives, plans, and recent audit."""
    db = get_supabase()
    
    case_query = db.table("cases").select("*, directives(*), action_plans(*)").eq("id", case_id).execute()
    if not case_query.data:
        raise CaseNotFoundException()
    
    case = case_query.data[0]
    if case.get("deleted_at"):
        raise CaseDeletedSoftlyException()

    # Fetch last 10 audit entries
    audit_query = db.table("audit_log").select("*").eq("case_id", case_id).order("created_at", desc=True).limit(10).execute()
    case["audit_trail"] = audit_query.data

    return case


@router.put("/{case_id}")
async def update_case(case_id: str, body: dict, user: dict = Depends(get_user)):
    """Update case status/info. Admin only. Validates status transitions."""
    if user["role"] != "admin":
        raise InsufficientPermissionsException()

    db = get_supabase()
    
    # 1. Fetch current
    existing = db.table("cases").select("*").eq("id", case_id).execute()
    if not existing.data:
        raise CaseNotFoundException()
    
    old_data = existing.data[0]
    new_status = body.get("status")
    
    # 2. Status Flow Validation
    if new_status:
        flow = ["uploaded", "extracting", "extracted", "pending_verification", "in_review", "verified", "actioned"]
        try:
            curr_idx = flow.index(old_data["status"])
            new_idx = flow.index(new_status)
            if new_idx <= curr_idx: # Simple check: can't go back or skip (strict)
                raise InvalidCaseStatusTransitionException(message=f"Cannot transition from {old_data['status']} to {new_status}")
        except ValueError:
            raise InvalidCaseStatusTransitionException()

    # 3. Update
    updates = {k: v for k, v in body.items() if k != "id"}
    result = db.table("cases").update(updates).eq("id", case_id).execute()
    
    # 4. Audit Log
    await log_audit(db, "case_updated", user["user_id"], case_id, {
        "old": old_data["status"],
        "new": new_status
    })
    
    return result.data[0]


@router.delete("/{case_id}")
async def delete_case(case_id: str, user: dict = Depends(get_user)):
    """Soft delete case. Admin only."""
    if user["role"] != "admin":
        raise InsufficientPermissionsException()

    db = get_supabase()
    db.table("cases").update({"deleted_at": datetime.now(timezone.utc).isoformat()}).eq("id", case_id).execute()
    
    await log_audit(db, "case_deleted", user["user_id"], case_id)
    
    return {"message": "Case removed"}
