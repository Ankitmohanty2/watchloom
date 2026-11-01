"""User repository for database operations."""
from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import NotFoundError
from app.models.user import UserModel


class UserRepository:
    """Repository for user database operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.users

    async def create(self, user_data: dict[str, Any]) -> dict[str, Any]:
        """Create a new user."""
        result = await self.collection.insert_one(user_data)
        user_data["_id"] = result.inserted_id
        return user_data

    async def find_by_email(self, email: str) -> dict[str, Any] | None:
        """Find user by email."""
        return await self.collection.find_one({"email": email.lower()})

    async def find_by_username(self, username: str) -> dict[str, Any] | None:
        """Find user by username."""
        return await self.collection.find_one({"username": username.lower()})

    async def find_by_id(self, user_id: str) -> dict[str, Any] | None:
        """Find user by ID."""
        try:
            return await self.collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            return None

    async def find_by_email_or_username(self, identifier: str) -> dict[str, Any] | None:
        """Find user by email or username."""
        identifier_lower = identifier.lower()
        return await self.collection.find_one(
            {"$or": [{"email": identifier_lower}, {"username": identifier_lower}]}
        )

    async def update(self, user_id: str, update_data: dict[str, Any]) -> dict[str, Any]:
        """Update user."""
        update_data["updated_at"] = datetime.utcnow()
        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True,
        )
        if not result:
            raise NotFoundError("User not found")
        return result

    async def update_password(self, user_id: str, password_hash: str) -> None:
        """Update user password."""
        await self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"password_hash": password_hash, "updated_at": datetime.utcnow()}},
        )

    async def verify_email(self, email: str) -> None:
        """Mark user's email as verified."""
        await self.collection.update_one(
            {"email": email.lower()},
            {"$set": {"email_verified": True, "updated_at": datetime.utcnow()}},
        )

    async def delete(self, user_id: str) -> None:
        """Delete user."""
        result = await self.collection.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise NotFoundError("User not found")
