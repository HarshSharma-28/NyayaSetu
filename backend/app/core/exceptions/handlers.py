"""
Exception handlers registered in main.py.
HYBRID approach:
  - Explicit handlers per exception type (not one global catch-all)
  - One true last-resort handler for completely unexpected errors
  - Each handler logs differently
  - Client NEVER sees internal details or tracebacks
"""
import traceback
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from datetime import datetime, timezone

from app.core.exceptions.base import NyayaSetuHTTPException
from app.core.logger import app_logger


async def handle_nyayasetu_http_exception(
    request: Request,
    exc: NyayaSetuHTTPException
) -> JSONResponse:
    """
    Handles all explicit NyayaSetu domain exceptions.
    Logs full detail internally, sends minimal info to client.
    """
    app_logger.warning(
        f"[{exc.error_code}] {exc.message} | "
        f"Path: {request.url.path} | "
        f"Details: {exc.details}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict()
    )


async def handle_validation_error(
    request: Request,
    exc: RequestValidationError
) -> JSONResponse:
    """
    Handles Pydantic v2 validation errors.
    Returns field-level errors — not raw Pydantic output.
    """
    field_errors = {}
    for error in exc.errors():
        field = '.'.join(str(loc) for loc in error.get('loc', []))
        field_errors[field] = error.get('msg', 'Invalid value')

    app_logger.warning(
        f"[VAL_001] Validation error | "
        f"Path: {request.url.path} | "
        f"Fields: {field_errors}"
    )
    return JSONResponse(
        status_code=422,
        content={
            "error_code": "VAL_001",
            "message": "Validation failed",
            "field_errors": field_errors,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


async def handle_starlette_http_exception(
    request: Request,
    exc: StarletteHTTPException
) -> JSONResponse:
    """
    Handles standard FastAPI/Starlette HTTP exceptions.
    Wraps in NyayaSetu format.
    """
    app_logger.warning(
        f"[HTTP_{exc.status_code}] {exc.detail} | "
        f"Path: {request.url.path}"
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": f"HTTP_{exc.status_code}",
            "message": str(exc.detail),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )


async def handle_unexpected_exception(
    request: Request,
    exc: Exception
) -> JSONResponse:
    """
    TRUE last-resort handler.
    Logs full traceback internally.
    Client sees ONLY a generic 500 message.
    NEVER expose stack trace to client.
    """
    tb = traceback.format_exc()
    app_logger.error(
        f"[UNHANDLED] Unexpected error on {request.url.path}: "
        f"{type(exc).__name__}: {exc}\n{tb}"
    )
    return JSONResponse(
        status_code=500,
        content={
            "error_code": "INTERNAL_500",
            "message": "An internal server error occurred. Our team has been notified.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )
