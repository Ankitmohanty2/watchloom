"""Statistics service."""
from typing import Any

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import DESCENDING


class StatisticsService:
    """Service for user statistics."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_user_statistics(self, user_id: str) -> dict[str, Any]:
        """Get comprehensive user statistics."""
        user_oid = ObjectId(user_id)

        # Library stats
        library_stats = await self._get_library_stats(user_oid)

        # Episode stats
        episode_stats = await self._get_episode_stats(user_oid)

        # Recently completed
        recently_completed = await self._get_recently_completed(user_oid, 5)

        # Currently watching
        currently_watching = await self._get_currently_watching(user_oid)

        # Favorite genres
        favorite_genres = await self._get_favorite_genres(user_oid)

        return {
            **library_stats,
            **episode_stats,
            "recently_completed": recently_completed,
            "currently_watching": currently_watching,
            "favorite_genres": favorite_genres,
        }

    async def _get_library_stats(self, user_id: ObjectId) -> dict[str, Any]:
        """Get library statistics."""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$lookup": {
                    "from": "media",
                    "localField": "media_id",
                    "foreignField": "_id",
                    "as": "media",
                }
            },
            {"$unwind": "$media"},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "media_types": {"$push": "$media.media_type"},
                }
            },
        ]

        results = await self.db.user_library.aggregate(pipeline).to_list(length=None)

        stats = {
            "total_titles": 0,
            "plan_to_watch": 0,
            "watching": 0,
            "completed": 0,
            "on_hold": 0,
            "dropped": 0,
            "completed_movies": 0,
            "completed_anime": 0,
            "completed_series": 0,
        }

        for item in results:
            status = item["_id"]
            count = item["count"]
            stats["total_titles"] += count
            if status in stats:
                stats[status] = count

            # Count by media type for completed
            if status == "completed":
                for media_type in item["media_types"]:
                    if media_type == "movie":
                        stats["completed_movies"] += 1
                    elif media_type == "anime":
                        stats["completed_anime"] += 1
                    elif media_type in ["tv", "web_series"]:
                        stats["completed_series"] += 1

        return stats

    async def _get_episode_stats(self, user_id: ObjectId) -> dict[str, int]:
        """Get episode watching statistics."""
        episodes_watched = await self.db.episode_progress.count_documents({"user_id": user_id})

        # Estimate total hours (assuming 25 min per episode)
        total_hours = round((episodes_watched * 25) / 60, 1)

        return {"episodes_watched": episodes_watched, "total_hours": total_hours}

    async def _get_recently_completed(self, user_id: ObjectId, limit: int) -> list[dict[str, Any]]:
        """Get recently completed titles."""
        cursor = (
            self.db.user_library.find({"user_id": user_id, "status": "completed"})
            .sort("completed_at", DESCENDING)
            .limit(limit)
        )

        items = await cursor.to_list(length=limit)

        # Fetch media details
        media_ids = [item["media_id"] for item in items]
        media_cursor = self.db.media.find({"_id": {"$in": media_ids}})
        media_docs = await media_cursor.to_list(length=None)
        media_dict = {str(doc["_id"]): doc for doc in media_docs}

        result = []
        for item in items:
            media_doc = media_dict.get(str(item["media_id"]))
            if media_doc:
                result.append(
                    {
                        "title": media_doc.get("title"),
                        "media_type": media_doc.get("media_type"),
                        "poster_path": media_doc.get("poster_path"),
                        "completed_at": (
                            item["completed_at"].isoformat() if item.get("completed_at") else None
                        ),
                    }
                )

        return result

    async def _get_currently_watching(self, user_id: ObjectId) -> list[dict[str, Any]]:
        """Get currently watching titles."""
        cursor = (
            self.db.user_library.find({"user_id": user_id, "status": "watching"})
            .sort("updated_at", DESCENDING)
            .limit(10)
        )

        items = await cursor.to_list(length=10)

        # Fetch media details
        media_ids = [item["media_id"] for item in items]
        media_cursor = self.db.media.find({"_id": {"$in": media_ids}})
        media_docs = await media_cursor.to_list(length=None)
        media_dict = {str(doc["_id"]): doc for doc in media_docs}

        result = []
        for item in items:
            media_doc = media_dict.get(str(item["media_id"]))
            if media_doc:
                result.append(
                    {
                        "media_id": str(item["media_id"]),
                        "title": media_doc.get("title"),
                        "media_type": media_doc.get("media_type"),
                        "poster_path": media_doc.get("poster_path"),
                    }
                )

        return result

    async def _get_favorite_genres(self, user_id: ObjectId, limit: int = 5) -> list[dict[str, Any]]:
        """Get user's favorite genres based on library."""
        pipeline = [
            {"$match": {"user_id": user_id}},
            {
                "$lookup": {
                    "from": "media",
                    "localField": "media_id",
                    "foreignField": "_id",
                    "as": "media",
                }
            },
            {"$unwind": "$media"},
            {"$unwind": "$media.genres"},
            {"$group": {"_id": "$media.genres", "count": {"$sum": 1}}},
            {"$sort": {"count": DESCENDING}},
            {"$limit": limit},
        ]

        results = await self.db.user_library.aggregate(pipeline).to_list(length=limit)
        return [{"genre": item["_id"], "count": item["count"]} for item in results]
