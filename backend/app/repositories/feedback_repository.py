"""Persistence for public Watchloom feedback."""
from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING, ReturnDocument

from app.models.feedback import FeedbackModel


class FeedbackRepository:
    """Read and write one feedback entry per account."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.site_feedback

    async def list_public(self, limit: int = 8) -> list[dict]:
        cursor = (
            self.collection.find({"is_public": True})
            .sort("updated_at", DESCENDING)
            .limit(limit)
        )
        return await cursor.to_list(length=limit)

    async def find_by_user(self, user_id: str) -> dict | None:
        return await self.collection.find_one({"user_id": ObjectId(user_id)})

    async def upsert(
        self,
        user_id: str,
        author_name: str,
        comment: str,
    ) -> dict:
        now = datetime.utcnow()
        document = FeedbackModel.new_document(user_id, author_name, comment, now)
        return await self.collection.find_one_and_update(
            {"user_id": document["user_id"]},
            {
                "$set": {
                    "author_name": document["author_name"],
                    "comment": document["comment"],
                    "is_public": True,
                    "public_consent_at": document["public_consent_at"],
                    "updated_at": now,
                },
                "$setOnInsert": {
                    "created_at": document["created_at"],
                },
            },
            upsert=True,
            return_document=ReturnDocument.AFTER,
        )

    async def delete_by_user(self, user_id: str) -> None:
        await self.collection.delete_one({"user_id": ObjectId(user_id)})
