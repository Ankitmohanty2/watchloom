"""Logging configuration."""
import logging
import sys

from app.core.config import settings


def setup_logging() -> None:
    """Configure application logging."""
    log_level = logging.DEBUG if not settings.is_production else logging.INFO

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Keep framework and database transport chatter out of normal app logs.
    for logger_name in (
        "uvicorn.access",
        "httpx",
        "motor",
        "pymongo",
        "pymongo.command",
        "pymongo.connection",
        "pymongo.serverSelection",
        "pymongo.topology",
        "pymongo.pool",
    ):
        logging.getLogger(logger_name).setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)
