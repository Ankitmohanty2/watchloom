"""Media repository for database operations."""
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.media import MediaModel


class MediaRepository:
    """Repository for media database operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.media

    async def create(self, media_data: dict[str, Any]) -> dict[str, Any]:
        """Create or update media entry."""
        # Check if media already exists by provider IDs
        provider_ids = media_data.get("provider_ids", {})
        query = []

        if provider_ids.get("tmdb_id"):
            query.append({"provider_ids.tmdb_id": provider_ids["tmdb_id"]})
        if provider_ids.get("anilist_id"):
            query.append({"provider_ids.anilist_id": provider_ids["anilist_id"]})

        if query:
            existing = await self.collection.find_one({"$or": query})
            if existing:
                # Update existing media
                await self.collection.update_one(
                    {"_id": existing["_id"]}, {"$set": media_data}
                )
                existing.update(media_data)
                return existing

        # Create new media
        result = await self.collection.insert_one(media_data)
        media_data["_id"] = result.inserted_id
        return media_data

    async def find_by_id(self, media_id: str) -> dict[str, Any] | None:
        """Find media by ID."""
        try:
            return await self.collection.find_one({"_id": ObjectId(media_id)})
        except Exception:
            return None

    async def find_by_provider_id(
        self, provider: str, provider_id: int
    ) -> dict[str, Any] | None:
        """Find media by provider ID."""
        return await self.collection.find_one({f"provider_ids.{provider}_id": provider_id})

    async def find_many_by_ids(self, media_ids: list[str]) -> list[dict[str, Any]]:
        """Find multiple media by IDs."""
        try:
            object_ids = [ObjectId(mid) for mid in media_ids]
            cursor = self.collection.find({"_id": {"$in": object_ids}})
            return await cursor.to_list(length=None)
        except Exception:
            return []
