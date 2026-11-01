"""Progress repository for database operations."""
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

from app.core.exceptions import NotFoundError


class ProgressRepository:
    """Repository for episode progress database operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.episode_progress

    async def mark_episode_watched(self, progress_data: dict[str, Any]) -> dict[str, Any]:
        """Mark an episode as watched."""
        try:
            # Use upsert to handle duplicate episodes
            result = await self.collection.find_one_and_update(
                {
                    "user_id": progress_data["user_id"],
                    "media_id": progress_data["media_id"],
                    "season_number": progress_data["season_number"],
                    "episode_number": progress_data["episode_number"],
                },
                {
                    "$set": {
                        "watched_at": progress_data["watched_at"],
                        "updated_at": progress_data["updated_at"],
                    },
                    "$setOnInsert": {
                        "user_id": progress_data["user_id"],
                        "media_id": progress_data["media_id"],
                        "season_number": progress_data["season_number"],
                        "episode_number": progress_data["episode_number"],
                    },
                },
                upsert=True,
                return_document=True,
            )
            return result
        except Exception:
            raise

    async def unmark_episode(
        self, user_id: str, media_id: str, season_number: int, episode_number: int
    ) -> None:
        """Remove episode watch record."""
        result = await self.collection.delete_one(
            {
                "user_id": ObjectId(user_id),
                "media_id": ObjectId(media_id),
                "season_number": season_number,
                "episode_number": episode_number,
            }
        )
        if result.deleted_count == 0:
            raise NotFoundError("Episode progress not found")

    async def get_media_progress(
        self, user_id: str, media_id: str
    ) -> list[dict[str, Any]]:
        """Get all watched episodes for a media."""
        cursor = self.collection.find(
            {"user_id": ObjectId(user_id), "media_id": ObjectId(media_id)}
        ).sort([("season_number", 1), ("episode_number", 1)])
        return await cursor.to_list(length=None)

    async def get_total_episodes_watched(self, user_id: str) -> int:
        """Get total episodes watched by user."""
        return await self.collection.count_documents({"user_id": ObjectId(user_id)})

    async def get_continue_watching(
        self, user_id: str, limit: int = 10
    ) -> list[dict[str, Any]]:
        """Get continue watching list (recently watched media with incomplete progress)."""
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {"$sort": {"watched_at": DESCENDING}},
            {
                "$group": {
                    "_id": "$media_id",
                    "last_watched_episode": {"$first": "$$ROOT"},
                    "total_watched": {"$sum": 1},
                }
            },
            {"$limit": limit},
        ]
        return await self.collection.aggregate(pipeline).to_list(length=limit)

    async def delete_all_for_media(self, user_id: str, media_id: str) -> int:
        """Delete all progress for a media."""
        result = await self.collection.delete_many(
            {"user_id": ObjectId(user_id), "media_id": ObjectId(media_id)}
        )
        return result.deleted_count
