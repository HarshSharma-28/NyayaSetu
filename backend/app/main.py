from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.config import settings
from app.core.logger import app_logger
from app.core.exceptions.base import NyayaSetuHTTPException
from app.core.exceptions.handlers import (
    handle_nyayasetu_http_exception,
    handle_validation_error,
    handle_starlette_http_exception,
    handle_unexpected_exception,
)
from app.core.security.headers_middleware import SecurityHeadersMiddleware
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, cases, directives, verify
from app.routers import dashboard, action_plans, users, notifications

app = FastAPI(
    title="NyayaSetu API",
    version=settings.API_VERSION,
    description="Court Judgment Intelligence Platform",
    docs_url="/docs",
    redoc_url=None,
)

# ── MIDDLEWARE ──────────────────────────────────────────────
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# ── EXCEPTION HANDLERS (HYBRID — NOT global catch-all) ─────
app.add_exception_handler(
    NyayaSetuHTTPException, handle_nyayasetu_http_exception
)
app.add_exception_handler(
    RequestValidationError, handle_validation_error
)
app.add_exception_handler(
    StarletteHTTPException, handle_starlette_http_exception
)
app.add_exception_handler(
    Exception, handle_unexpected_exception  # true last resort only
)

# ── ROUTERS ────────────────────────────────────────────────
PREFIX = f"/api/{settings.API_VERSION}"
app.include_router(auth.router,          prefix=PREFIX + "/auth")
app.include_router(cases.router,         prefix=PREFIX + "/cases")
app.include_router(directives.router,    prefix=PREFIX + "/directives")
app.include_router(verify.router,        prefix=PREFIX + "/verify")
app.include_router(dashboard.router,     prefix=PREFIX + "/dashboard")
app.include_router(action_plans.router,  prefix=PREFIX + "/action-plans")
app.include_router(users.router,         prefix=PREFIX + "/users")
app.include_router(notifications.router, prefix=PREFIX + "/notifications")


# ── HEALTH ─────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": settings.API_VERSION,
        "demo_mode": settings.DEMO_MODE,
        "environment": settings.ENVIRONMENT
    }


@app.get("/ping")
async def ping():
    """UptimeRobot keep-alive endpoint."""
    return {"pong": True}


app_logger.info(
    f"NyayaSetu API started | "
    f"env={settings.ENVIRONMENT} | "
    f"demo={settings.DEMO_MODE}"
)
