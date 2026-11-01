"""Episode progress data models."""
from datetime import datetime
from typing import Any

from bson import ObjectId


class ProgressModel:
    """Episode progress document model for MongoDB."""

    @staticmethod
    def create(
        user_id: str,
        media_id: str,
        season_number: int,
        episode_number: int,
    ) -> dict[str, Any]:
        """Create a new episode progress document."""
        now = datetime.utcnow()
        return {
            "user_id": ObjectId(user_id),
            "media_id": ObjectId(media_id),
            "season_number": season_number,
            "episode_number": episode_number,
            "watched_at": now,
            "updated_at": now,
        }

    @staticmethod
    def to_dict(progress_doc: dict[str, Any]) -> dict[str, Any]:
        """Convert MongoDB document to dictionary."""
        if progress_doc is None:
            return None
        return {
            "id": str(progress_doc["_id"]),
            "user_id": str(progress_doc["user_id"]),
            "media_id": str(progress_doc["media_id"]),
            "season_number": progress_doc["season_number"],
            "episode_number": progress_doc["episode_number"],
            "watched_at": progress_doc["watched_at"].isoformat(),
            "updated_at": progress_doc["updated_at"].isoformat(),
        }
