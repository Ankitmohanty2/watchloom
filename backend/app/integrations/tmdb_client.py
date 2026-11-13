"""TMDB API client."""
from typing import Any

import httpx

from app.core.cache import TTLCache
from app.core.config import settings
from app.core.exceptions import ExternalAPIError
from app.core.logging import get_logger

logger = get_logger(__name__)


class TMDBClient:
    """Client for The Movie Database (TMDB) API."""

    BASE_URL = "https://api.themoviedb.org/3"
    IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

    # How long catalog responses are reused before asking TMDB again (seconds).
    LIST_TTL = 15 * 60
    SEARCH_TTL = 5 * 60
    DETAIL_TTL = 60 * 60
    REFERENCE_TTL = 12 * 60 * 60

    def __init__(self):
        self.api_key = settings.tmdb_api_key
        self.timeout = 10.0
        self._client: httpx.AsyncClient | None = None
        self._cache = TTLCache()

    def _get_client(self) -> httpx.AsyncClient:
        """Reuse one connection pool so requests skip the TLS handshake."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=self.timeout,
                # Retry once when the connection itself fails; responses are never retried.
                transport=httpx.AsyncHTTPTransport(
                    retries=1,
                    limits=httpx.Limits(max_keepalive_connections=10, max_connections=20),
                ),
            )
        return self._client

    async def aclose(self) -> None:
        """Close the shared connection pool."""
        if self._client is not None and not self._client.is_closed:
            await self._client.aclose()
        self._client = None

    def _get_image_url(self, path: str | None, size: str = "w500") -> str | None:
        """Get full image URL from path."""
        if not path:
            return None
        return f"{self.IMAGE_BASE_URL}/{size}{path}"

    async def _request(
        self, endpoint: str, params: dict[str, Any] | None = None, ttl: float | None = None
    ) -> dict[str, Any]:
        """Make a cached request to the TMDB API."""
        query = dict(params or {})
        cache_key = endpoint + "?" + "&".join(f"{k}={query[k]}" for k in sorted(query))
        return await self._cache.get_or_set(
            cache_key,
            self.LIST_TTL if ttl is None else ttl,
            lambda: self._fetch(endpoint, query),
        )

    async def _fetch(self, endpoint: str, params: dict[str, Any]) -> dict[str, Any]:
        """Make request to TMDB API."""
        url = f"{self.BASE_URL}/{endpoint}"

        try:
            response = await self._get_client().get(
                url, params={**params, "api_key": self.api_key}
            )
            response.raise_for_status()
            return response.json()
        except httpx.TimeoutException as e:
            logger.error(f"TMDB API timeout: {endpoint}")
            raise ExternalAPIError("TMDB API timeout") from e
        except httpx.HTTPStatusError as e:
            # Avoid logging the request URL because it contains the API key.
            logger.error("TMDB API error for %s: HTTP %s", endpoint, e.response.status_code)
            raise ExternalAPIError(f"TMDB API error: {e.response.status_code}") from e
        except httpx.RequestError as e:
            logger.error("TMDB connection failed for %s (%s)", endpoint, type(e).__name__)
            raise ExternalAPIError("TMDB API connection failed") from e
        except Exception as e:
            logger.error("TMDB API unexpected error for %s (%s)", endpoint, type(e).__name__)
            raise ExternalAPIError("TMDB API error") from e

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
            "languages": [
                language.get("english_name") or language.get("name") or language.get("iso_639_1")
                for language in movie.get("spoken_languages", [])
                if isinstance(language, dict)
            ],
            "countries": [
                country.get("name") or country.get("iso_3166_1")
                for country in movie.get("production_countries", [])
                if isinstance(country, dict)
            ],
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
            "languages": [
                language.get("english_name") or language.get("name") or language.get("iso_639_1")
                for language in tv.get("spoken_languages", [])
                if isinstance(language, dict)
            ],
            "countries": [
                country.get("name") if isinstance(country, dict) else country
                for country in tv.get("origin_country", [])
                if isinstance(country, str | dict)
            ],
            "rating": tv.get("vote_average"),
            "runtime": next(iter(tv.get("episode_run_time") or []), None),
            "trailer_url": self._select_trailer_url((tv.get("videos") or {}).get("results", [])),
            "season_count": tv.get("number_of_seasons"),
            "episode_count": tv.get("number_of_episodes"),
            "status": tv.get("status"),
        }

    async def search_multi(self, query: str, page: int = 1) -> dict[str, Any]:
        """Search across movies and TV shows."""
        return await self._request("search/multi", {"query": query, "page": page}, self.SEARCH_TTL)

    async def search_movie(self, query: str, page: int = 1) -> dict[str, Any]:
        """Search movies."""
        return await self._request("search/movie", {"query": query, "page": page}, self.SEARCH_TTL)

    async def search_tv(self, query: str, page: int = 1) -> dict[str, Any]:
        """Search TV shows."""
        return await self._request("search/tv", {"query": query, "page": page}, self.SEARCH_TTL)

    async def get_movie(self, movie_id: int) -> dict[str, Any]:
        """Get movie details."""
        data = await self._request(
            f"movie/{movie_id}", {"append_to_response": "videos"}, self.DETAIL_TTL
        )
        return self._normalize_movie(data)

    async def get_tv(self, tv_id: int) -> dict[str, Any]:
        """Get TV show details."""
        data = await self._request(
            f"tv/{tv_id}", {"append_to_response": "videos"}, self.DETAIL_TTL
        )
        return self._normalize_tv(data)

    async def get_trailer_url(self, media_type: str, media_id: int) -> str | None:
        endpoint = "movie" if media_type == "movie" else "tv"
        data = await self._request(f"{endpoint}/{media_id}/videos", ttl=self.DETAIL_TTL)
        return self._select_trailer_url(data.get("results", []))

    async def get_trending(self, media_type: str = "all", time_window: str = "week", page: int = 1) -> dict[str, Any]:
        """Get trending media."""
        return await self._request(f"trending/{media_type}/{time_window}", {"page": page})

    async def get_popular_movies(self, page: int = 1) -> dict[str, Any]:
        """Get popular movies."""
        return await self._request("movie/popular", {"page": page})

    async def get_movie_watch_providers(self, region: str = "IN") -> dict[str, Any]:
        """Get streaming services currently listed for a region."""
        return await self._request(
            "watch/providers/movie", {"watch_region": region}, self.REFERENCE_TTL
        )

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
        data = await self._request("genre/movie/list", ttl=self.REFERENCE_TTL)
        return data.get("genres", [])

    async def get_tv_genres(self) -> list[dict[str, Any]]:
        """Get TV genres."""
        data = await self._request("genre/tv/list", ttl=self.REFERENCE_TTL)
        return data.get("genres", [])

    async def get_similar_movies(self, movie_id: int, page: int = 1) -> dict[str, Any]:
        """Get similar movies."""
        return await self._request(f"movie/{movie_id}/similar", {"page": page}, self.DETAIL_TTL)

    async def get_similar_tv(self, tv_id: int, page: int = 1) -> dict[str, Any]:
        """Get similar TV shows."""
        return await self._request(f"tv/{tv_id}/similar", {"page": page}, self.DETAIL_TTL)


# Global instance
tmdb_client = TMDBClient()
