from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.core.config import settings
from app.core.exceptions.auth_exceptions import (
    TokenExpiredException,
    TokenInvalidException
)
import uuid

# In-memory token blacklist (production: Redis)
_token_blacklist: set[str] = set()


def create_access_token(payload: dict) -> str:
    jti = str(uuid.uuid4())
    data = {
        **payload,
        "jti": jti,
        "exp": datetime.now(timezone.utc) + timedelta(
            minutes=settings.JWT_EXPIRE_MINUTES
        ),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(data, settings.JWT_SECRET,
                      algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        jti = payload.get("jti")
        if jti and jti in _token_blacklist:
            raise TokenInvalidException(
                details={"reason": "Token has been revoked"}
            )
        return payload
    except JWTError as exc:
        err = str(exc).lower()
        if "expired" in err:
            raise TokenExpiredException()
        raise TokenInvalidException(
            details={"jose_error": str(exc)}
        )


def blacklist_token(token: str) -> None:
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False}
        )
        jti = payload.get("jti")
        if jti:
            _token_blacklist.add(jti)
    except Exception:
        pass  # Token already invalid — safe to ignore
