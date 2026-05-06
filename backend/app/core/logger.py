import logging
import logging.handlers
from pathlib import Path


# Ensure logs directory exists
Path("logs").mkdir(exist_ok=True)


def _make_formatter() -> logging.Formatter:
    return logging.Formatter(
        fmt='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )


def _make_rotating_handler(
    filename: str,
    level: int
) -> logging.handlers.RotatingFileHandler:
    handler = logging.handlers.RotatingFileHandler(
        filename=f"logs/{filename}",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    handler.setLevel(level)
    handler.setFormatter(_make_formatter())
    return handler


def get_app_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.DEBUG)
        logger.addHandler(_make_rotating_handler("app.log", logging.DEBUG))
        logger.addHandler(_make_rotating_handler("errors.log", logging.WARNING))
        # Console
        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        console.setFormatter(_make_formatter())
        logger.addHandler(console)
    return logger


def get_audit_logger() -> logging.Logger:
    logger = logging.getLogger("audit")
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        logger.addHandler(
            _make_rotating_handler("audit.log", logging.INFO)
        )
    return logger


# Module-level loggers
app_logger = get_app_logger("nyayasetu")
audit_logger = get_audit_logger()
