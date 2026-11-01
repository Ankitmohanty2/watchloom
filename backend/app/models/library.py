"""Library data models."""
from datetime import datetime
from typing import Any

from bson import ObjectId


class LibraryModel:
    """User library document model for MongoDB."""

    @staticmethod
    def create(
        user_id: str,
        media_id: str,
        status: str = "plan_to_watch",
    ) -> dict[str, Any]:
        """Create a new library entry document."""
        now = datetime.utcnow()
        return {
            "user_id": ObjectId(user_id),
            "media_id": ObjectId(media_id),
            "status": status,
            "personal_rating": None,
            "notes": None,
            "started_at": now if status == "watching" else None,
            "completed_at": now if status == "completed" else None,
            "added_at": now,
            "updated_at": now,
        }

    @staticmethod
    def to_dict(library_doc: dict[str, Any], media_doc: dict[str, Any] = None) -> dict[str, Any]:
        """Convert MongoDB document to dictionary."""
        if library_doc is None:
            return None

        result = {
            "id": str(library_doc["_id"]),
            "user_id": str(library_doc["user_id"]),
            "media_id": str(library_doc["media_id"]),
            "status": library_doc["status"],
            "personal_rating": library_doc.get("personal_rating"),
            "notes": library_doc.get("notes"),
            "started_at": (
                library_doc["started_at"].isoformat() if library_doc.get("started_at") else None
            ),
            "completed_at": (
                library_doc["completed_at"].isoformat()
                if library_doc.get("completed_at")
                else None
            ),
            "added_at": library_doc["added_at"].isoformat(),
            "updated_at": library_doc["updated_at"].isoformat(),
        }

        # Include media details if provided
        if media_doc:
            from app.models.media import MediaModel

            result["media"] = MediaModel.to_dict(media_doc)

        return result
