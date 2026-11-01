"""TMDB API client."""
import httpx
from typing import Any

from app.core.config import settings
from app.core.exceptions import ExternalAPIError
from app.core.logging import get_logger

logger = get_logger(__name__)


class TMDBClient:
    """Client for The Movie Database (TMDB) API."""

    BASE_URL = "https://api.themoviedb.org/3"
    IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

    def __init__(self):
        self.api_key = settings.tmdb_api_key
        self.timeout = 10.0

    def _get_image_url(self, path: str | None, size: str = "w500") -> str | None:
        """Get full image URL from path."""
        if not path:
            return None
        return f"{self.IMAGE_BASE_URL}/{size}{path}"

    async def _request(self, endpoint: str, params: dict[str, Any] = None) -> dict[str, Any]:
        """Make request to TMDB API."""
        if params is None:
            params = {}
        params["api_key"] = self.api_key

        url = f"{self.BASE_URL}/{endpoint}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                return response.json()
        except httpx.TimeoutException:
            logger.error(f"TMDB API timeout: {endpoint}")
            raise ExternalAPIError("TMDB API timeout")
        except httpx.HTTPStatusError as e:
            # Avoid logging the request URL because it contains the API key.
            logger.error("TMDB API error for %s: HTTP %s", endpoint, e.response.status_code)
            raise ExternalAPIError(f"TMDB API error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error("TMDB connection failed for %s (%s)", endpoint, type(e).__name__)
            raise ExternalAPIError("TMDB API connection failed")
        except Exception as e:
            logger.error("TMDB API unexpected error for %s (%s)", endpoint, type(e).__name__)
            raise ExternalAPIError("TMDB API error")

    def _select_trailer_url(self, videos: list[dict[str, Any]]) -> str | None:
        youtube_trailers = [
            video for video in videos
            if str(video.get("site") or "").lower() == "youtube"
            and video.get("key")
            and video.get("type") in {"Trailer", "Teaser"}
        ]
        if not youtube_trailers:
            return None
        youtube_trailers.sort(
            key=lambda video: (
                video.get("type") != "Trailer",
                not video.get("official", False),
            )
        )
        return f"https://www.youtube.com/watch?v={youtube_trailers[0]['key']}"

    def _normalize_movie(self, movie: dict[str, Any]) -> dict[str, Any]:
        """Normalize TMDB movie to common format."""
        return {
            "provider_ids": {"tmdb_id": movie["id"]},
            "media_type": "movie",
            "title": movie.get("title", ""),
            "original_title": movie.get("original_title"),
            "synopsis": movie.get("overview"),
            "poster_path": self._get_image_url(movie.get("poster_path")),
            "backdrop_path": self._get_image_url(movie.get("backdrop_path"), "original"),
            "release_date": movie.get("release_date"),
            "genres": [genre["name"] for genre in movie.get("genres", [])]
            if "genres" in movie
            else [],
            "languages": movie.get("spoken_languages", []),
            "countries": movie.get("production_countries", []),
            "rating": movie.get("vote_average"),
            "runtime": movie.get("runtime"),
            "trailer_url": self._select_trailer_url((movie.get("videos") or {}).get("results", [])),
        }

    def _normalize_tv(self, tv: dict[str, Any]) -> dict[str, Any]:
        """Normalize TMDB TV show to common format."""
        return {
            "provider_ids": {"tmdb_id": tv["id"]},
            "media_type": "tv",
            "title": tv.get("name", ""),
            "original_title": tv.get("original_name"),
            "synopsis": tv.get("overview"),
            "poster_path": self._get_image_url(tv.get("poster_path")),
            "backdrop_path": self._get_image_url(tv.get("backdrop_path"), "original"),
            "release_date": tv.get("first_air_date"),
            "genres": [genre["name"] for genre in tv.get("genres", [])]
            if "genres" in tv
            else [],
            "languages": tv.get("spoken_languages", []),
            "countries": tv.get("origin_country", []),
            "rating": tv.get("vote_average"),
            "trailer_url": self._select_trailer_url((tv.get("videos") or {}).get("results", [])),
            "season_count": tv.get("number_of_seasons"),
            "episode_count": tv.get("number_of_episodes"),
            "status": tv.get("status"),
        }

    async def search_multi(self, query: str, page: int = 1) -> dict[str, Any]:
        """Search across movies and TV shows."""
        return await self._request("search/multi", {"query": query, "page": page})

    async def search_movie(self, query: str, page: int = 1) -> dict[str, Any]:
        """Search movies."""
        return await self._request("search/movie", {"query": query, "page": page})

    async def search_tv(self, query: str, page: int = 1) -> dict[str, Any]:
        """Search TV shows."""
        return await self._request("search/tv", {"query": query, "page": page})

    async def get_movie(self, movie_id: int) -> dict[str, Any]:
        """Get movie details."""
        data = await self._request(f"movie/{movie_id}", {"append_to_response": "videos"})
        return self._normalize_movie(data)

    async def get_tv(self, tv_id: int) -> dict[str, Any]:
        """Get TV show details."""
        data = await self._request(f"tv/{tv_id}", {"append_to_response": "videos"})
        return self._normalize_tv(data)

    async def get_trailer_url(self, media_type: str, media_id: int) -> str | None:
        endpoint = "movie" if media_type == "movie" else "tv"
        data = await self._request(f"{endpoint}/{media_id}/videos")
        return self._select_trailer_url(data.get("results", []))

    async def get_trending(self, media_type: str = "all", time_window: str = "week", page: int = 1) -> dict[str, Any]:
        """Get trending media."""
        return await self._request(f"trending/{media_type}/{time_window}", {"page": page})

    async def get_popular_movies(self, page: int = 1) -> dict[str, Any]:
        """Get popular movies."""
        return await self._request("movie/popular", {"page": page})

    async def get_popular_tv(self, page: int = 1) -> dict[str, Any]:
        """Get popular TV shows."""
        return await self._request("tv/popular", {"page": page})

    async def discover_movie(self, params: dict[str, Any]) -> dict[str, Any]:
        """Discover movies with filters."""
        return await self._request("discover/movie", params)

    async def discover_tv(self, params: dict[str, Any]) -> dict[str, Any]:
        """Discover TV shows with filters."""
        return await self._request("discover/tv", params)

    async def get_movie_genres(self) -> list[dict[str, Any]]:
        """Get movie genres."""
        data = await self._request("genre/movie/list")
        return data.get("genres", [])

    async def get_tv_genres(self) -> list[dict[str, Any]]:
        """Get TV genres."""
        data = await self._request("genre/tv/list")
        return data.get("genres", [])

    async def get_similar_movies(self, movie_id: int, page: int = 1) -> dict[str, Any]:
        """Get similar movies."""
        return await self._request(f"movie/{movie_id}/similar", {"page": page})

    async def get_similar_tv(self, tv_id: int, page: int = 1) -> dict[str, Any]:
        """Get similar TV shows."""
        return await self._request(f"tv/{tv_id}/similar", {"page": page})


# Global instance
tmdb_client = TMDBClient()




