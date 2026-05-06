from collections import defaultdict
from datetime import datetime, timedelta
from app.core.exceptions.auth_exceptions import RateLimitExceededException

# In-memory store: {key: [(timestamp, count)]}
_store: dict[str, list[datetime]] = defaultdict(list)


def _clean(timestamps: list[datetime], window: timedelta) -> list[datetime]:
    cutoff = datetime.utcnow() - window
    return [t for t in timestamps if t > cutoff]


def check_rate_limit(key: str, max_calls: int, window_seconds: int) -> None:
    window = timedelta(seconds=window_seconds)
    _store[key] = _clean(_store[key], window)
    if len(_store[key]) >= max_calls:
        raise RateLimitExceededException(
            details={
                "key": key,
                "max_calls": max_calls,
                "window_seconds": window_seconds
            }
        )
    _store[key].append(datetime.utcnow())
