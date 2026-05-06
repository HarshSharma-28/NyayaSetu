from datetime import datetime, timezone
from typing import Any


class NyayaSetuBaseException(Exception):
    """
    Base for ALL NyayaSetu custom exceptions.
    Every exception must define error_code, status_code, message.
    Never let generic Exception bubble up to the client.
    """
    error_code: str = "NYAYA_000"
    status_code: int = 500
    message: str = "An unexpected error occurred"

    def __init__(
        self,
        message: str | None = None,
        details: dict[str, Any] | None = None,
        **kwargs: Any
    ):
        self.message = message or self.__class__.message
        self.details = details or {}
        self.timestamp = datetime.now(timezone.utc).isoformat()
        super().__init__(self.message)

    def to_dict(self) -> dict:
        """Client-safe dict — never includes internal details."""
        return {
            "error_code": self.error_code,
            "message": self.message,
            "timestamp": self.timestamp,
        }

    def to_log_dict(self) -> dict:
        """Full dict for internal logging — includes details."""
        return {
            **self.to_dict(),
            "details": self.details,
        }


class NyayaSetuHTTPException(NyayaSetuBaseException):
    """Raised when we need to return an HTTP error response."""
    pass
