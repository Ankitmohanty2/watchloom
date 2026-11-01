"""User data models."""
from datetime import datetime
from typing import Any


class UserModel:
    """User document model for MongoDB."""

    @staticmethod
    def create(
        display_name: str,
        username: str,
        email: str,
        password_hash: str,
    ) -> dict[str, Any]:
        """Create a new user document."""
        now = datetime.utcnow()
        return {
            "display_name": display_name,
            "username": username.lower(),
            "email": email.lower(),
            "password_hash": password_hash,
            "email_verified": False,
            "avatar": None,
            "preferences": {
                "theme": "light",
                "default_view": "grid",
                "favorite_genres": [],
                "preferred_languages": ["en"],
            },
            "privacy_settings": {
                "profile_public": False,
                "library_public": False,
            },
            "created_at": now,
            "updated_at": now,
        }

    @staticmethod
    def to_dict(user_doc: dict[str, Any]) -> dict[str, Any]:
        """Convert MongoDB document to dictionary."""
        if user_doc is None:
            return None
        return {
            "id": str(user_doc["_id"]),
            "display_name": user_doc["display_name"],
            "username": user_doc["username"],
            "email": user_doc["email"],
            "email_verified": user_doc.get("email_verified", False),
            "avatar": user_doc.get("avatar"),
            "preferences": user_doc.get("preferences", {}),
            "privacy_settings": user_doc.get("privacy_settings", {}),
            "created_at": user_doc["created_at"].isoformat(),
            "updated_at": user_doc["updated_at"].isoformat(),
        }
