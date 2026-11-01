"""Media Pydantic schemas."""
from datetime import date

from pydantic import BaseModel, Field


class ProviderIds(BaseModel):
    """External provider IDs."""

    tmdb_id: int | None = None
    anilist_id: int | None = None


class MediaBase(BaseModel):
    """Base media schema."""

    media_type: str  # anime, movie, tv, web_series
    title: str
    original_title: str | None = None
    synopsis: str | None = None
    poster_path: str | None = None
    backdrop_path: str | None = None
    release_date: str | None = None
    genres: list[str] = []
    languages: list[str] = []
    countries: list[str] = []
    rating: float | None = None
    runtime: int | None = None
    season_count: int | None = None
    episode_count: int | None = None
    status: str | None = None
    trailer_url: str | None = None


class MediaResponse(MediaBase):
    """Media response schema."""

    id: str
    provider_ids: ProviderIds
    cast: list[dict] = []
    crew: list[dict] = []


class MediaSearchParams(BaseModel):
    """Media search parameters."""

    query: str = Field(..., min_length=1)
    media_type: str | None = None  # anime, movie, tv
    page: int = Field(default=1, ge=1)


class MediaDiscoverParams(BaseModel):
    """Media discovery parameters."""

    media_type: str | None = None
    genre: str | None = None
    year: int | None = None
    language: str | None = None
    country: str | None = None
    sort_by: str = "popularity"  # popularity, rating, release_date
    page: int = Field(default=1, ge=1)


class GenreResponse(BaseModel):
    """Genre response schema."""

    id: int | str
    name: str
