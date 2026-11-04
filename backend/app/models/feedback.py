"""Site feedback document helpers."""
from datetime import datetime
from typing import Any

from bson import ObjectId


class FeedbackModel:
    """Create public-safe feedback response data."""

    @staticmethod
    def to_dict(feedback_doc: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": str(feedback_doc["_id"]),
            "author_name": feedback_doc["author_name"],
            "comment": feedback_doc["comment"],
            "created_at": feedback_doc["created_at"],
            "updated_at": feedback_doc["updated_at"],
        }

    @staticmethod
    def new_document(
        user_id: str,
        author_name: str,
        comment: str,
        now: datetime,
    ) -> dict[str, Any]:
        return {
            "user_id": ObjectId(user_id),
            "author_name": author_name,
            "comment": comment,
            "is_public": True,
            "public_consent_at": now,
            "created_at": now,
            "updated_at": now,
        }
