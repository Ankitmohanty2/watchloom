"""AniList API client."""
import hashlib
import json
from typing import Any

import httpx

from app.core.cache import TTLCache
from app.core.config import settings
from app.core.exceptions import ExternalAPIError
from app.core.logging import get_logger

logger = get_logger(__name__)


class AniListClient:
    """Client for AniList GraphQL API."""

    # How long catalog responses are reused before asking AniList again (seconds).
    LIST_TTL = 15 * 60
    SEARCH_TTL = 5 * 60
    DETAIL_TTL = 60 * 60

    def __init__(self):
        self.api_url = settings.anilist_api_url
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

    async def _request(
        self, query: str, variables: dict[str, Any] | None = None, ttl: float | None = None
    ) -> dict[str, Any]:
        """Make a cached GraphQL request to the AniList API."""
        request_variables = dict(variables or {})
        cache_key = hashlib.sha1(
            json.dumps([query, request_variables], sort_keys=True).encode()
        ).hexdigest()
        return await self._cache.get_or_set(
            cache_key,
            self.LIST_TTL if ttl is None else ttl,
            lambda: self._fetch(query, request_variables),
        )

    async def _fetch(self, query: str, variables: dict[str, Any]) -> dict[str, Any]:
        """Make GraphQL request to AniList API."""
        try:
            response = await self._get_client().post(
                self.api_url,
                json={"query": query, "variables": variables},
            )
            response.raise_for_status()
            data = response.json()

            if "errors" in data:
                logger.error(f"AniList API errors: {data['errors']}")
                raise ExternalAPIError("AniList API error")

            return data.get("data", {})
        except ExternalAPIError:
            raise
        except httpx.TimeoutException as e:
            logger.error("AniList API timeout")
            raise ExternalAPIError("AniList API timeout") from e
        except httpx.HTTPStatusError as e:
            logger.error(f"AniList API error: {e}")
            raise ExternalAPIError(f"AniList API error: {e.response.status_code}") from e
        except Exception as e:
            logger.error(f"AniList API unexpected error: {e}")
            raise ExternalAPIError("AniList API error") from e

    def _get_trailer_url(self, trailer: dict[str, Any] | None) -> str | None:
        if not trailer or str(trailer.get("site") or "").lower() != "youtube" or not trailer.get("id"):
            return None
        return f"https://www.youtube.com/watch?v={trailer['id']}"

    def _normalize_anime(self, anime: dict[str, Any]) -> dict[str, Any]:
        """Normalize AniList anime to common format."""
        cover_image = anime.get("coverImage", {})
        title_data = anime.get("title", {})

        return {
            "provider_ids": {"anilist_id": anime["id"]},
            "media_type": "anime",
            "title": title_data.get("english") or title_data.get("romaji", ""),
            "original_title": title_data.get("native"),
            "synopsis": anime.get("description"),
            "poster_path": cover_image.get("large"),
            "backdrop_path": anime.get("bannerImage"),
            "trailer_url": self._get_trailer_url(anime.get("trailer")),
            "release_date": self._format_anilist_date(anime.get("startDate")),
            "format": anime.get("format"),
            "genres": anime.get("genres", []),
            "rating": anime.get("averageScore"),
            "runtime": anime.get("duration"),
            "episode_count": anime.get("episodes"),
            "status": anime.get("status"),
        }

    def _format_anilist_date(self, date_obj: dict | None) -> str | None:
        """Format AniList date object to string."""
        if not date_obj or not date_obj.get("year"):
            return None
        year = date_obj.get("year")
        month = date_obj.get("month", 1)
        day = date_obj.get("day", 1)
        return f"{year:04d}-{month:02d}-{day:02d}"

    async def search_anime(self, query: str, page: int = 1, per_page: int = 20) -> dict[str, Any]:
        """Search anime."""
        graphql_query = """
        query ($search: String, $page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
            media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                medium
              }
              bannerImage
              trailer { id site }
              startDate {
                year
                month
                day
              }
              genres
              format
              averageScore
              episodes
              duration
              status
            }
          }
        }
        """

        variables = {"search": query, "page": page, "perPage": per_page}
        data = await self._request(graphql_query, variables, self.SEARCH_TTL)
        return data.get("Page", {})

    async def get_anime(self, anime_id: int) -> dict[str, Any]:
        """Get anime details."""
        query = """
        query ($id: Int) {
          Media(id: $id, type: ANIME) {
            id
            title {
              romaji
              english
              native
            }
            description
            coverImage {
              large
              medium
            }
            bannerImage
            trailer { id site }
            startDate {
              year
              month
              day
            }
            endDate {
              year
              month
              day
            }
            genres
            format
            averageScore
            episodes
            duration
            status
            season
            seasonYear
            studios {
              nodes {
                name
              }
            }
            staff {
              edges {
                role
                node {
                  name {
                    full
                  }
                }
              }
            }
          }
        }
        """

        variables = {"id": anime_id}
        data = await self._request(query, variables, self.DETAIL_TTL)
        return self._normalize_anime(data.get("Media", {}))

    async def get_recommended_anime(self, anime_id: int, page: int = 1, per_page: int = 12) -> dict[str, Any]:
        """Get AniList's community recommendations for an anime."""
        query = """
        query ($id: Int, $page: Int, $perPage: Int) {
          Media(id: $id, type: ANIME) {
            recommendations(page: $page, perPage: $perPage, sort: RATING_DESC) {
              pageInfo {
                hasNextPage
              }
              nodes {
                mediaRecommendation {
                  id
                  title { romaji english native }
                  description
                  coverImage { large }
                  bannerImage
                  startDate { year month day }
                  genres
                  format
                  averageScore
                  episodes
                  duration
                  status
                  trailer { id site }
                }
              }
            }
          }
        }
        """
        data = await self._request(
            query, {"id": anime_id, "page": page, "perPage": per_page}, self.DETAIL_TTL
        )
        recommendations = (data.get("Media") or {}).get("recommendations") or {}
        return {
            "results": recommendations.get("nodes", []),
            "has_next_page": (recommendations.get("pageInfo") or {}).get("hasNextPage", False),
        }

    async def get_trending_anime(self, page: int = 1, per_page: int = 20) -> dict[str, Any]:
        """Get trending anime."""
        query = """
        query ($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
            media(type: ANIME, sort: TRENDING_DESC) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                medium
              }
              bannerImage
              trailer { id site }
              startDate {
                year
                month
                day
              }
              genres
              format
              averageScore
              episodes
              duration
              status
            }
          }
        }
        """

        variables = {"page": page, "perPage": per_page}
        data = await self._request(query, variables)
        return data.get("Page", {})

    async def get_popular_anime(self, page: int = 1, per_page: int = 20) -> dict[str, Any]:
        """Get popular anime."""
        query = """
        query ($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo {
              total
              currentPage
              lastPage
              hasNextPage
              perPage
            }
            media(type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
                medium
              }
              bannerImage
              trailer { id site }
              startDate {
                year
                month
                day
              }
              genres
              format
              averageScore
              episodes
              duration
              status
            }
          }
        }
        """

        variables = {"page": page, "perPage": per_page}
        data = await self._request(query, variables)
        return data.get("Page", {})


# Global instance
anilist_client = AniListClient()




