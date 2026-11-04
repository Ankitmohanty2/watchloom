"""Episode progress service."""
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.media import MediaModel
from app.models.progress import ProgressModel
from app.repositories.progress_repository import ProgressRepository


class ProgressService:
    """Service for episode progress operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.progress_repo = ProgressRepository(db)

    async def mark_episode_watched(
        self, user_id: str, media_id: str, season_number: int, episode_number: int
    ) -> dict[str, Any]:
        """Mark an episode as watched."""
        progress_data = ProgressModel.create(user_id, media_id, season_number, episode_number)
        progress_doc = await self.progress_repo.mark_episode_watched(progress_data)
        return ProgressModel.to_dict(progress_doc)

    async def unmark_episode(
        self, user_id: str, media_id: str, season_number: int, episode_number: int
    ) -> None:
        """Remove episode watch record."""
        await self.progress_repo.unmark_episode(user_id, media_id, season_number, episode_number)

    async def get_media_progress(self, user_id: str, media_id: str) -> dict[str, Any]:
        """Get all watched episodes for a media."""
        episodes = await self.progress_repo.get_media_progress(user_id, media_id)
        return {
            "media_id": media_id,
            "total_episodes_watched": len(episodes),
            "episodes": [ProgressModel.to_dict(ep) for ep in episodes],
        }

    async def get_continue_watching(self, user_id: str, limit: int = 10) -> list[dict[str, Any]]:
        """Get continue watching list."""
        grouped_progress = await self.progress_repo.get_continue_watching(user_id, limit)
        if not grouped_progress:
            return []

        media_ids = [item["_id"] for item in grouped_progress]
        media_documents = await self.db.media.find({"_id": {"$in": media_ids}}).to_list(length=len(media_ids))
        media_by_id = {media_doc["_id"]: media_doc for media_doc in media_documents}
        results = []

        for item in grouped_progress:
            media_doc = media_by_id.get(item["_id"])
            if not media_doc:
                continue

            last_episode = item["last_watched_episode"]
            results.append(
                {
                    "media": MediaModel.to_dict(media_doc),
                    "last_watched_episode": {
                        "season_number": last_episode["season_number"],
                        "episode_number": last_episode["episode_number"],
                        "watched_at": last_episode["watched_at"],
                    },
                    "total_watched": item["total_watched"],
                }
            )

        return results
