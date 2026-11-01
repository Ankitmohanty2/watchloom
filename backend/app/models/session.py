"""Session and token data models."""
from datetime import datetime, timedelta
from typing import Any

from bson import ObjectId


class SessionModel:
    """Refresh token session model for MongoDB."""

    @staticmethod
    def create(user_id: str, token_hash: str, expires_days: int = 7) -> dict[str, Any]:
        """Create a new refresh token session document."""
        now = datetime.utcnow()
        return {
            "user_id": ObjectId(user_id),
            "token_hash": token_hash,
            "created_at": now,
            "expires_at": now + timedelta(days=expires_days),
            "revoked": False,
        }


class VerificationTokenModel:
    """Email verification token model."""

    @staticmethod
    def create(email: str, token_hash: str, expires_hours: int = 24) -> dict[str, Any]:
        """Create a new email verification token document."""
        now = datetime.utcnow()
        return {
            "email": email.lower(),
            "token_hash": token_hash,
            "created_at": now,
            "expires_at": now + timedelta(hours=expires_hours),
            "used": False,
        }


class PasswordResetTokenModel:
    """Password reset token model."""

    @staticmethod
    def create(email: str, token_hash: str, expires_hours: int = 1) -> dict[str, Any]:
        """Create a new password reset token document."""
        now = datetime.utcnow()
        return {
            "email": email.lower(),
            "token_hash": token_hash,
            "created_at": now,
            "expires_at": now + timedelta(hours=expires_hours),
            "used": False,
        }
