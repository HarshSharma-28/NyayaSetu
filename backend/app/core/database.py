from supabase import create_client, Client
from app.core.config import settings
from app.core.logger import app_logger
from app.core.exceptions.database_exceptions import DatabaseConnectionException

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """
    Returns the Supabase service client (bypasses RLS).
    All RLS logic is enforced at the application layer via role checks.
    Raises DatabaseConnectionException explicitly — never silently.
    """
    global _supabase_client
    if _supabase_client is None:
        try:
            _supabase_client = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_KEY
            )
            app_logger.info("Supabase client initialized successfully")
        except Exception as exc:
            app_logger.error(f"Failed to initialize Supabase client: {exc}")
            raise DatabaseConnectionException(
                details={"original_error": str(exc)}
            )
    return _supabase_client
