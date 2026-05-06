"""
CORS configuration — extracted for clarity.
Used by main.py when adding CORSMiddleware.
"""
from app.core.config import settings

CORS_CONFIG = {
    "allow_origins": settings.CORS_ORIGINS,
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Authorization", "Content-Type"],
}
