from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_KEY: str  # Service role key (bypasses RLS for backend)
    SUPABASE_ANON_KEY: str

    # JWT
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 480

    # App
    DEMO_MODE: bool = True
    ENVIRONMENT: str = "development"
    API_VERSION: str = "v1"

    # Email (for notifications)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAIL_FROM: str = "noreply@nyayasetu.gov.in"

    # Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://nyayasetu.vercel.app"
    ]

    # Rate limiting
    RATE_LIMIT_LOGIN: int = 5       # per 15 min
    RATE_LIMIT_OTP: int = 3         # per 5 min
    RATE_LIMIT_UPLOAD: int = 10     # per hour

    # Storage
    PDF_MAX_SIZE_MB: int = 20
    PDF_BUCKET: str = "judgment-pdfs"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
