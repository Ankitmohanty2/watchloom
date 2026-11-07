"""Logging configuration."""
import logging
import sys

from app.core.config import settings


class _QuietDriverNoise(logging.Filter):
    """Drop routine MongoDB driver chatter while preserving actionable warnings."""

    def filter(self, record: logging.LogRecord) -> bool:
        is_driver_log = record.name == "pymongo" or record.name.startswith(
            ("pymongo.", "motor.")
        )
        return not is_driver_log or record.levelno >= logging.WARNING


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

    # A handler filter also catches driver records if a library resets its logger
    # level after application startup. Keep warnings and errors visible.
    root_logger = logging.getLogger()
    if not any(isinstance(log_filter, _QuietDriverNoise) for log_filter in root_logger.filters):
        root_logger.addFilter(_QuietDriverNoise())
    for handler in root_logger.handlers:
        if not any(isinstance(log_filter, _QuietDriverNoise) for log_filter in handler.filters):
            handler.addFilter(_QuietDriverNoise())


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)
