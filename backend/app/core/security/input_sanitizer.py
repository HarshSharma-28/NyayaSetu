"""
Input sanitizer — strips dangerous characters from user-submitted strings.
Applied at the router level before any database operation.
"""
import re
import html
from typing import Any


# Patterns that should NEVER appear in user input
_SQL_INJECTION_PATTERN = re.compile(
    r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)",
    re.IGNORECASE
)
_SCRIPT_TAG_PATTERN = re.compile(
    r"<\s*script[^>]*>.*?</\s*script\s*>",
    re.IGNORECASE | re.DOTALL
)


def sanitize_string(value: str) -> str:
    """
    Sanitize a single string value:
    1. Strip leading/trailing whitespace
    2. HTML-escape special characters
    3. Remove script tags
    4. Collapse multiple spaces
    """
    if not isinstance(value, str):
        return value

    value = value.strip()
    value = html.escape(value, quote=True)
    value = _SCRIPT_TAG_PATTERN.sub("", value)
    value = re.sub(r"\s+", " ", value)
    return value


def sanitize_dict(data: dict[str, Any]) -> dict[str, Any]:
    """Recursively sanitize all string values in a dictionary."""
    sanitized = {}
    for key, value in data.items():
        if isinstance(value, str):
            sanitized[key] = sanitize_string(value)
        elif isinstance(value, dict):
            sanitized[key] = sanitize_dict(value)
        elif isinstance(value, list):
            sanitized[key] = [
                sanitize_string(v) if isinstance(v, str)
                else sanitize_dict(v) if isinstance(v, dict)
                else v
                for v in value
            ]
        else:
            sanitized[key] = value
    return sanitized


def contains_sql_injection(value: str) -> bool:
    """Check if a string contains potential SQL injection patterns."""
    return bool(_SQL_INJECTION_PATTERN.search(value))
