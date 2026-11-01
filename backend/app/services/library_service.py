"""Library service."""
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import ConflictError, NotFoundError
from app.models.library import LibraryModel
from app.repositories.library_repository import LibraryRepository
from app.repositories.media_repository import MediaRepository
from app.utils.pagination import get_skip_limit


class LibraryService:
    """Service for library operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.library_repo = LibraryRepository(db)
        self.media_repo = MediaRepository(db)

    async def add_to_library(
        self, user_id: str, media_id: str, status: str = "plan_to_watch"
    ) -> dict[str, Any]:
        """Add media to user's library."""
        # Check if already in library
        existing = await self.library_repo.find_by_user_and_media(user_id, media_id)
        if existing:
            raise ConflictError("Media already in library")

        # Verify media exists
        media_doc = await self.media_repo.find_by_id(media_id)
        if not media_doc:
            raise NotFoundError("Media not found")

        # Create library entry
        library_data = LibraryModel.create(user_id, media_id, status)
        library_doc = await self.library_repo.create(library_data)

        return LibraryModel.to_dict(library_doc, media_doc)

    async def get_user_library(
        self,
        user_id: str,
        status: str | None = None,
        page: int = 1,
        limit: int = 20,
        sort_by: str = "updated_at",
    ) -> dict[str, Any]:
        """Get user's library with pagination."""
        skip, limit = get_skip_limit(page, limit)
        items, total = await self.library_repo.find_user_library(
            user_id, status, skip, limit, sort_by
        )

        # Fetch media details
        media_ids = [str(item["media_id"]) for item in items]
        media_docs = await self.media_repo.find_many_by_ids(media_ids)
        media_dict = {str(doc["_id"]): doc for doc in media_docs}

        # Combine library and media data
        result_items = []
        for item in items:
            media_doc = media_dict.get(str(item["media_id"]))
            result_items.append(LibraryModel.to_dict(item, media_doc))

        return {
            "items": result_items,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit,
        }

    async def update_library_entry(
        self, item_id: str, user_id: str, update_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Update library entry."""
        library_doc = await self.library_repo.update(item_id, user_id, update_data)
        media_doc = await self.media_repo.find_by_id(str(library_doc["media_id"]))
        return LibraryModel.to_dict(library_doc, media_doc)

    async def remove_from_library(self, item_id: str, user_id: str) -> None:
        """Remove media from library."""
        await self.library_repo.delete(item_id, user_id)

    async def bulk_update(
        self, item_ids: list[str], user_id: str, update_data: dict[str, Any]
    ) -> int:
        """Bulk update library entries."""
        return await self.library_repo.bulk_update(item_ids, user_id, update_data)

    async def get_library_stats(self, user_id: str) -> dict[str, Any]:
        """Get user's library statistics."""
        return await self.library_repo.get_stats(user_id)
