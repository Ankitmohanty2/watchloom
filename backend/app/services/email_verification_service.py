"""Authenticated email ownership verification flow."""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Any

from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.logging import get_logger
from app.models.user import UserModel
from app.repositories.user_repository import UserRepository
from app.services.email_service import EmailService

CODE_TTL = timedelta(minutes=10)
RESEND_COOLDOWN = timedelta(seconds=60)
MAX_ATTEMPTS = 5
logger = get_logger(__name__)


class EmailVerificationService:
    """Issue, deliver, and consume short-lived email verification codes."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.codes = db.email_verification_tokens
        self.users = UserRepository(db)
        self.email_service = EmailService()

    async def request_code(self, email: str) -> None:
        """Create and send a six-digit verification code."""
        if not self.email_service.is_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email delivery is not configured on the server.",
            )

        normalized_email = email.lower()
        now = datetime.utcnow()
        existing = await self.codes.find_one({"email": normalized_email})
        if existing and existing.get("created_at", now) > now - RESEND_COOLDOWN:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Wait a minute before requesting another code.",
            )

        code = f"{secrets.randbelow(1_000_000):06d}"
        code_hash = self._hash_code(normalized_email, code)
        await self.codes.delete_many({"email": normalized_email})
        await self.codes.insert_one(
            {
                "email": normalized_email,
                "token_hash": code_hash,
                "created_at": now,
                "expires_at": now + CODE_TTL,
                "attempts": 0,
            }
        )

        try:
            await self.email_service.send_email_verification_code(normalized_email, code)
        except Exception as error:
            logger.error("Email verification delivery failed: %s", error)
            await self.codes.delete_one({"email": normalized_email, "token_hash": code_hash})
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="We could not send the verification code. Please try again later.",
            ) from error

    async def verify_code(self, user_id: str, email: str, code: str) -> dict[str, Any]:
        """Consume a valid code and return the now-verified profile."""
        normalized_email = email.lower()
        now = datetime.utcnow()
        record = await self.codes.find_one({"email": normalized_email})
        if not record or record.get("expires_at", now) <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That code is invalid or expired. Request a new one.",
            )

        if record.get("attempts", 0) >= MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect codes. Request a new one in a minute.",
            )

        expected_hash = self._hash_code(normalized_email, code)
        if not hmac.compare_digest(record["token_hash"], expected_hash):
            result = await self.codes.update_one(
                {"_id": record["_id"], "attempts": {"$lt": MAX_ATTEMPTS}},
                {"$inc": {"attempts": 1}},
            )
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many incorrect codes. Request a new one in a minute.",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That code is incorrect. Check the email and try again.",
            )

        consumed = await self.codes.delete_one(
            {
                "_id": record["_id"],
                "token_hash": record["token_hash"],
                "expires_at": {"$gt": now},
                "attempts": {"$lt": MAX_ATTEMPTS},
            }
        )
        if consumed.deleted_count != 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That code is invalid or expired. Request a new one.",
            )

        await self.users.verify_email(normalized_email)
        user_doc = await self.users.find_by_id(user_id)
        if not user_doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
        return UserModel.to_dict(user_doc)

    @staticmethod
    def _hash_code(email: str, code: str) -> str:
        return hmac.new(
            settings.jwt_secret_key.encode("utf-8"),
            f"{email}:{code}".encode(),
            hashlib.sha256,
        ).hexdigest()
