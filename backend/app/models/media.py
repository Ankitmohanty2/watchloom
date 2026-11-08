"""Media data models."""
from datetime import datetime
from typing import Any


class MediaModel:
    """Media document model for MongoDB."""

    @staticmethod
    def _string_values(values: Any, keys: tuple[str, ...]) -> list[str]:
        """Normalize provider strings and legacy provider objects for API responses."""
        if not isinstance(values, list | tuple):
            return []

        normalized: list[str] = []
        for value in values:
            candidate = value
            if isinstance(value, dict):
                candidate = next((value.get(key) for key in keys if value.get(key)), None)
            if isinstance(candidate, str) and candidate.strip():
                normalized.append(candidate.strip())
        return normalized

    @staticmethod
    def create(
        media_type: str,
        title: str,
        provider_ids: dict[str, Any],
        **kwargs: Any,
    ) -> dict[str, Any]:
        """Create a new media document."""
        now = datetime.utcnow()
        return {
            "media_type": media_type,
            "title": title,
            "original_title": kwargs.get("original_title"),
            "provider_ids": provider_ids,
            "synopsis": kwargs.get("synopsis"),
            "poster_path": kwargs.get("poster_path"),
            "backdrop_path": kwargs.get("backdrop_path"),
            "release_date": kwargs.get("release_date"),
            "genres": kwargs.get("genres", []),
            "languages": MediaModel._string_values(
                kwargs.get("languages", []), ("english_name", "name", "iso_639_1")
            ),
            "countries": MediaModel._string_values(
                kwargs.get("countries", []), ("name", "iso_3166_1", "code")
            ),
            "rating": kwargs.get("rating"),
            "runtime": kwargs.get("runtime"),
            "season_count": kwargs.get("season_count"),
            "episode_count": kwargs.get("episode_count"),
            "status": kwargs.get("status"),
            "trailer_url": kwargs.get("trailer_url"),
            "cast": kwargs.get("cast", []),
            "crew": kwargs.get("crew", []),
            "metadata_updated_at": now,
            "created_at": now,
        }

    @staticmethod
    def to_dict(media_doc: dict[str, Any]) -> dict[str, Any]:
        """Convert MongoDB document to dictionary."""
        if media_doc is None:
            return None
        return {
            "id": str(media_doc["_id"]),
            "media_type": media_doc["media_type"],
            "title": media_doc["title"],
            "original_title": media_doc.get("original_title"),
            "provider_ids": media_doc.get("provider_ids", {}),
            "synopsis": media_doc.get("synopsis"),
            "poster_path": media_doc.get("poster_path"),
            "backdrop_path": media_doc.get("backdrop_path"),
            "release_date": media_doc.get("release_date"),
            "genres": media_doc.get("genres", []),
            "languages": MediaModel._string_values(
                media_doc.get("languages", []), ("english_name", "name", "iso_639_1")
            ),
            "countries": MediaModel._string_values(
                media_doc.get("countries", []), ("name", "iso_3166_1", "code")
            ),
            "rating": media_doc.get("rating"),
            "runtime": media_doc.get("runtime"),
            "season_count": media_doc.get("season_count"),
            "episode_count": media_doc.get("episode_count"),
            "status": media_doc.get("status"),
            "trailer_url": media_doc.get("trailer_url"),
            "cast": media_doc.get("cast", []),
            "crew": media_doc.get("crew", []),
        }
