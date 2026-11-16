"""Site improvement issue document helpers."""

from datetime import datetime
from typing import Any

class SiteIssueModel:
    """Create and serialize site issue documents."""

    @staticmethod
    def create(
        *,
        message: str,
        category: str,
        contact_email: str | None,
        page_path: str | None,
        user_id: str | None,
    ) -> dict[str, Any]:
        now = datetime.utcnow()
        return {
            "message": message.strip(),
            "category": category,
            "contact_email": contact_email.lower() if contact_email else None,
            "page_path": page_path,
            "user_id": user_id,
            "status": "open",
            "created_at": now,
            "updated_at": now,
        }

    @staticmethod
    def to_dict(doc: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": str(doc["_id"]),
            "category": doc["category"],
            "message": doc["message"],
            "contact_email": doc.get("contact_email"),
            "page_path": doc.get("page_path"),
            "user_id": doc.get("user_id"),
            "status": doc.get("status", "open"),
            "created_at": doc["created_at"],
        }