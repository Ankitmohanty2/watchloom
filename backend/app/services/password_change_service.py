"""Email-verified password change flow."""
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

from bson import ObjectId
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.core.logging import get_logger
from app.core.security import hash_password
from app.repositories.user_repository import UserRepository
from app.services.email_service import EmailService

OTP_TTL = timedelta(minutes=10)
OTP_RESEND_COOLDOWN = timedelta(seconds=60)
OTP_MAX_ATTEMPTS = 5
logger = get_logger(__name__)


class PasswordChangeService:
    """Create and verify one-time codes for authenticated password changes."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.otp_collection = db.password_change_otps
        self.user_repo = UserRepository(db)
        self.email_service = EmailService()

    async def request_code(self, user_id: str, email: str) -> None:
        """Create a one-time code and send it to the account email."""
        if not self.email_service.is_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Email delivery is not configured on the server.",
            )

        object_user_id = ObjectId(user_id)
        now = datetime.utcnow()
        existing = await self.otp_collection.find_one({"user_id": object_user_id})
        if existing and existing.get("created_at", now) > now - OTP_RESEND_COOLDOWN:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Wait a minute before requesting another code.",
            )

        code = f"{secrets.randbelow(1_000_000):06d}"
        token_hash = self._hash_code(code)
        await self.otp_collection.update_one(
            {"user_id": object_user_id},
            {
                "$set": {
                    "code_hash": token_hash,
                    "created_at": now,
                    "expires_at": now + OTP_TTL,
                    "attempts": 0,
                },
                "$setOnInsert": {"user_id": object_user_id},
            },
            upsert=True,
        )

        try:
            await self.email_service.send_password_change_code(email, code)
        except Exception as error:
            logger.error("Password change email delivery failed: %s", error)
            await self.otp_collection.delete_one({"user_id": object_user_id})
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="We could not send the email code. Please try again later.",
            ) from error

    async def change_password(self, user_id: str, code: str, new_password: str) -> None:
        """Validate and consume the code, then replace the password hash."""
        object_user_id = ObjectId(user_id)
        now = datetime.utcnow()
        record = await self.otp_collection.find_one({"user_id": object_user_id})
        if not record or record.get("expires_at", now) <= now:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That code is invalid or expired. Request a new one.",
            )

        if record.get("attempts", 0) >= OTP_MAX_ATTEMPTS:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many incorrect codes. Request a new one in a minute.",
            )

        if not hmac.compare_digest(record["code_hash"], self._hash_code(code)):
            result = await self.otp_collection.update_one(
                {"_id": record["_id"], "attempts": {"$lt": OTP_MAX_ATTEMPTS}},
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

        consumed = await self.otp_collection.delete_one(
            {
                "_id": record["_id"],
                "code_hash": record["code_hash"],
                "expires_at": {"$gt": now},
                "attempts": {"$lt": OTP_MAX_ATTEMPTS},
            }
        )
        if consumed.deleted_count != 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="That code is invalid or expired. Request a new one.",
            )

        await self.user_repo.update_password(user_id, hash_password(new_password))

    @staticmethod
    def _hash_code(code: str) -> str:
        return hmac.new(
            settings.jwt_secret_key.encode("utf-8"),
            code.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
