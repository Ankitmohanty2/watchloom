"""Library repository for database operations."""
from datetime import datetime
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING

from app.core.exceptions import ConflictError, NotFoundError


class LibraryRepository:
    """Repository for user library database operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.user_library

    async def create(self, library_data: dict[str, Any]) -> dict[str, Any]:
        """Add media to user library."""
        try:
            result = await self.collection.insert_one(library_data)
            library_data["_id"] = result.inserted_id
            return library_data
        except Exception as e:
            if "duplicate key error" in str(e):
                raise ConflictError("Media already in library")
            raise

    async def find_by_user_and_media(
        self, user_id: str, media_id: str
    ) -> dict[str, Any] | None:
        """Find library entry by user and media."""
        return await self.collection.find_one(
            {"user_id": ObjectId(user_id), "media_id": ObjectId(media_id)}
        )

    async def find_by_id(self, item_id: str) -> dict[str, Any] | None:
        """Find library entry by ID."""
        try:
            return await self.collection.find_one({"_id": ObjectId(item_id)})
        except Exception:
            return None

    async def find_user_library(
        self,
        user_id: str,
        status: str | None = None,
        skip: int = 0,
        limit: int = 20,
        sort_by: str = "updated_at",
    ) -> tuple[list[dict[str, Any]], int]:
        """Find user's library entries."""
        query = {"user_id": ObjectId(user_id)}
        if status:
            query["status"] = status

        # Sort mapping
        sort_fields = {
            "updated_at": ("updated_at", DESCENDING),
            "added_at": ("added_at", DESCENDING),
            "title": ("title", 1),
        }
        sort_field, sort_order = sort_fields.get(sort_by, ("updated_at", DESCENDING))

        total = await self.collection.count_documents(query)
        cursor = self.collection.find(query).sort(sort_field, sort_order).skip(skip).limit(limit)
        items = await cursor.to_list(length=limit)

        return items, total

    async def update(self, item_id: str, user_id: str, update_data: dict[str, Any]) -> dict[str, Any]:
        """Update library entry."""
        update_data["updated_at"] = datetime.utcnow()

        # Update timestamps based on status changes
        if "status" in update_data:
            if update_data["status"] == "watching" and "started_at" not in update_data:
                update_data["started_at"] = datetime.utcnow()
            elif update_data["status"] == "completed":
                update_data["completed_at"] = datetime.utcnow()

        result = await self.collection.find_one_and_update(
            {"_id": ObjectId(item_id), "user_id": ObjectId(user_id)},
            {"$set": update_data},
            return_document=True,
        )
        if not result:
            raise NotFoundError("Library entry not found")
        return result

    async def delete(self, item_id: str, user_id: str) -> None:
        """Delete library entry."""
        result = await self.collection.delete_one(
            {"_id": ObjectId(item_id), "user_id": ObjectId(user_id)}
        )
        if result.deleted_count == 0:
            raise NotFoundError("Library entry not found")

    async def bulk_update(
        self, item_ids: list[str], user_id: str, update_data: dict[str, Any]
    ) -> int:
        """Bulk update library entries."""
        update_data["updated_at"] = datetime.utcnow()
        try:
            object_ids = [ObjectId(iid) for iid in item_ids]
            result = await self.collection.update_many(
                {"_id": {"$in": object_ids}, "user_id": ObjectId(user_id)},
                {"$set": update_data},
            )
            return result.modified_count
        except Exception:
            return 0

    async def get_stats(self, user_id: str) -> dict[str, Any]:
        """Get user library statistics."""
        pipeline = [
            {"$match": {"user_id": ObjectId(user_id)}},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                }
            },
        ]
        results = await self.collection.aggregate(pipeline).to_list(length=None)
        stats = {item["_id"]: item["count"] for item in results}

        return {
            "total_titles": sum(stats.values()),
            "plan_to_watch": stats.get("plan_to_watch", 0),
            "watching": stats.get("watching", 0),
            "completed": stats.get("completed", 0),
            "on_hold": stats.get("on_hold", 0),
            "dropped": stats.get("dropped", 0),
        }
