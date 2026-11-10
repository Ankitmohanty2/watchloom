"""Media service."""
from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.integrations.anilist_client import anilist_client
from app.integrations.tmdb_client import tmdb_client
from app.models.media import MediaModel
from app.repositories.media_repository import MediaRepository
from app.schemas.media import MovieCollection

MOVIE_COLLECTION_FILTERS: dict[str, dict[str, str]] = {
    "top_rated": {"sort_by": "vote_average.desc", "vote_count.gte": "100"},
    "hollywood": {"with_origin_country": "US", "with_original_language": "en"},
    "bollywood": {"with_origin_country": "IN", "with_original_language": "hi"},
    "tollywood": {"with_origin_country": "IN", "with_original_language": "te"},
    "malayalam": {"with_origin_country": "IN", "with_original_language": "ml"},
    "tamil": {"with_origin_country": "IN", "with_original_language": "ta"},
    "kannada": {"with_origin_country": "IN", "with_original_language": "kn"},
    "bengali": {"with_origin_country": "IN", "with_original_language": "bn"},
    "marathi": {"with_origin_country": "IN", "with_original_language": "mr"},
    "ott": {
        "watch_region": "IN",
        "with_watch_monetization_types": "flatrate",
        "vote_count.gte": "20",
    },
}


class MediaService:
    """Service for media operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.media_repo = MediaRepository(db)
        self.tmdb = tmdb_client
        self.anilist = anilist_client

    async def search(
        self, query: str, media_type: str | None = None, page: int = 1
    ) -> dict[str, Any]:
        """Search across all providers."""
        results = []
        has_next_page = False

        if media_type in [None, "movie", "tv"]:
            # Search TMDB
            try:
                tmdb_results = await self.tmdb.search_multi(query, page)
                allowed_types = {"movie", "tv"} if media_type is None else {media_type}
                for item in tmdb_results.get("results", []):
                    if item.get("media_type") in allowed_types:
                        results.append(self._normalize_tmdb_result(item))
                has_next_page = page < tmdb_results.get("total_pages", page)
            except Exception:
                pass

        if media_type in [None, "anime"]:
            # Search AniList
            try:
                anilist_results = await self.anilist.search_anime(query, page)
                for item in anilist_results.get("media", []):
                    results.append(self._normalize_anilist_result(item))
                page_info = anilist_results.get("pageInfo") or {}
                has_next_page = has_next_page or page_info.get("hasNextPage", False)
            except Exception:
                pass

        return {"results": results, "page": page, "has_next_page": has_next_page}

    async def get_trending(self, media_type: str = "all", page: int = 1) -> dict[str, Any]:
        """Get trending media."""
        results = []
        has_next_page = False

        if media_type in ["all", "movie", "tv"]:
            try:
                tmdb_results = await self.tmdb.get_trending("all", "week", page)
                for item in tmdb_results.get("results", []):
                    if item.get("media_type") in ({"movie", "tv"} if media_type == "all" else {media_type}):
                        results.append(self._normalize_tmdb_result(item))
                has_next_page = page < tmdb_results.get("total_pages", page)
            except Exception:
                pass

        if media_type in ["all", "anime"]:
            try:
                anilist_results = await self.anilist.get_trending_anime(page)
                for item in anilist_results.get("media", []):
                    results.append(self._normalize_anilist_result(item))
                page_info = anilist_results.get("pageInfo") or {}
                has_next_page = has_next_page or page_info.get("hasNextPage", False)
            except Exception:
                pass

        return {"results": results, "page": page, "has_next_page": has_next_page}

    async def get_popular(
        self, media_type: str, page: int = 1, collection: MovieCollection = "popular"
    ) -> dict[str, Any]:
        """Get popular media by type."""
        results = []
        has_next_page = False

        if media_type == "movie":
            if collection in MOVIE_COLLECTION_FILTERS:
                tmdb_results = await self.tmdb.discover_movie(
                    {
                        "include_adult": "false",
                        "sort_by": "popularity.desc",
                        **MOVIE_COLLECTION_FILTERS[collection],
                        "page": page,
                    }
                )
            else:
                tmdb_results = await self.tmdb.get_popular_movies(page)
            for item in tmdb_results.get("results", []):
                results.append(self._normalize_tmdb_result({**item, "media_type": "movie"}))
            has_next_page = page < tmdb_results.get("total_pages", page)
        elif media_type == "tv":
            tmdb_results = await self.tmdb.get_popular_tv(page)
            for item in tmdb_results.get("results", []):
                results.append(self._normalize_tmdb_result({**item, "media_type": "tv"}))
            has_next_page = page < tmdb_results.get("total_pages", page)
        elif media_type == "anime":
            anilist_results = await self.anilist.get_popular_anime(page)
            for item in anilist_results.get("media", []):
                results.append(self._normalize_anilist_result(item))
            page_info = anilist_results.get("pageInfo") or {}
            has_next_page = page_info.get("hasNextPage", False)

        return {"results": results, "page": page, "has_next_page": has_next_page}

    async def get_trailer_url(self, provider: str, provider_id: int, media_type: str) -> str | None:
        if provider == "tmdb" and media_type in {"movie", "tv"}:
            return await self.tmdb.get_trailer_url(media_type, provider_id)
        if provider == "anilist" and media_type == "anime":
            anime = await self.anilist.get_anime(provider_id)
            return anime.get("trailer_url")
        return None

    async def get_similar_media(
        self, provider: str, provider_id: int, media_type: str, page: int = 1
    ) -> dict[str, Any]:
        """Return provider recommendations normalized for media cards."""
        results = []
        has_next_page = False

        if provider == "tmdb" and media_type == "movie":
            response = await self.tmdb.get_similar_movies(provider_id, page)
            has_next_page = page < response.get("total_pages", page)
            results = [
                self._normalize_tmdb_result({**item, "media_type": "movie"})
                for item in response.get("results", [])
                if item.get("id") != provider_id
            ]
        elif provider == "tmdb" and media_type == "tv":
            response = await self.tmdb.get_similar_tv(provider_id, page)
            has_next_page = page < response.get("total_pages", page)
            results = [
                self._normalize_tmdb_result({**item, "media_type": "tv"})
                for item in response.get("results", [])
                if item.get("id") != provider_id
            ]
        elif provider == "anilist" and media_type == "anime":
            response = await self.anilist.get_recommended_anime(provider_id, page)
            recommendations = response.get("results", [])
            has_next_page = response.get("has_next_page", False)
            seen_ids = set()
            for recommendation in recommendations:
                item = recommendation.get("mediaRecommendation") or {}
                item_id = item.get("id")
                if not item_id or item_id == provider_id or item_id in seen_ids:
                    continue
                seen_ids.add(item_id)
                results.append(self._normalize_anilist_result(item))

        return {"results": results, "page": page, "has_next_page": has_next_page}

    async def get_media_details(self, media_id: str) -> dict[str, Any]:
        """Get media details from database or fetch from provider."""
        # Try to get from database
        media_doc = await self.media_repo.find_by_id(media_id)
        if media_doc:
            return MediaModel.to_dict(media_doc)
        return None

    async def get_or_create_media(
        self, provider: str, provider_id: int, media_type: str
    ) -> dict[str, Any]:
        """Get media from database or fetch and create."""
        # Check if exists
        media_doc = await self.media_repo.find_by_provider_id(provider, provider_id)
        if media_doc:
            return MediaModel.to_dict(media_doc)

        # Fetch from provider and create
        if provider == "tmdb":
            if media_type == "movie":
                data = await self.tmdb.get_movie(provider_id)
            else:
                data = await self.tmdb.get_tv(provider_id)
        elif provider == "anilist":
            data = await self.anilist.get_anime(provider_id)
        else:
            return None

        # Create in database
        media_data = MediaModel.create(**data)
        media_doc = await self.media_repo.create(media_data)
        return MediaModel.to_dict(media_doc)

    async def get_genres(self, media_type: str = "movie") -> list[dict[str, Any]]:
        """Get genres for media type."""
        if media_type == "movie":
            return await self.tmdb.get_movie_genres()
        elif media_type == "tv":
            return await self.tmdb.get_tv_genres()
        return []

    def _normalize_tmdb_result(self, item: dict[str, Any]) -> dict[str, Any]:
        """Normalize TMDB search result."""
        media_type = item.get("media_type", "movie")
        title = item.get("title") if media_type == "movie" else item.get("name")
        poster_path = self.tmdb._get_image_url(item.get("poster_path"))

        return {
            "provider": "tmdb",
            "provider_id": item["id"],
            "media_type": media_type,
            "title": title,
            "synopsis": item.get("overview"),
            "poster_path": poster_path,
            "backdrop_path": self.tmdb._get_image_url(item.get("backdrop_path"), "original"),
            "release_date": item.get("release_date") or item.get("first_air_date"),
            "rating": item.get("vote_average"),
            "runtime": item.get("runtime") or next(iter(item.get("episode_run_time") or []), None),
        }

    def _normalize_anilist_result(self, item: dict[str, Any]) -> dict[str, Any]:
        """Normalize AniList search result."""
        title_data = item.get("title", {})
        cover_image = item.get("coverImage", {})

        return {
            "provider": "anilist",
            "provider_id": item["id"],
            "media_type": "anime",
            "title": title_data.get("english") or title_data.get("romaji", ""),
            "synopsis": item.get("description"),
            "poster_path": cover_image.get("large"),
            "backdrop_path": item.get("bannerImage"),
            "release_date": self.anilist._format_anilist_date(item.get("startDate")),
            "format": item.get("format"),
            "rating": item.get("averageScore"),
            "runtime": item.get("duration"),
            "trailer_url": self.anilist._get_trailer_url(item.get("trailer")),
            "genres": item.get("genres", []),
            "episode_count": item.get("episodes"),
            "status": item.get("status"),
        }


