"""Library Pydantic schemas."""
from pydantic import BaseModel, Field

from app.schemas.media import MediaResponse


class AddToLibraryRequest(BaseModel):
    """Add media to library request."""

    media_id: str
    status: str = Field(default="plan_to_watch")  # plan_to_watch, watching, completed, on_hold, dropped


class UpdateLibraryRequest(BaseModel):
    """Update library entry request."""

    status: str | None = None
    personal_rating: int | None = Field(None, ge=1, le=10)
    notes: str | None = None


class BulkUpdateRequest(BaseModel):
    """Bulk update library entries request."""

    item_ids: list[str]
    status: str | None = None
    personal_rating: int | None = Field(None, ge=1, le=10)


class LibraryResponse(BaseModel):
    """Library entry response schema."""

    id: str
    user_id: str
    media_id: str
    status: str
    personal_rating: int | None = None
    notes: str | None = None
    started_at: str | None = None
    completed_at: str | None = None
    added_at: str
    updated_at: str
    media: MediaResponse | None = None


class LibraryFilterParams(BaseModel):
    """Library filter parameters."""

    status: str | None = None
    media_type: str | None = None
    genre: str | None = None
    search: str | None = None
    sort_by: str = "updated_at"  # updated_at, added_at, title, rating
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=20, ge=1, le=100)


class LibraryStatsResponse(BaseModel):
    """Library statistics response."""

    total_titles: int
    plan_to_watch: int
    watching: int
    completed: int
    on_hold: int
    dropped: int
    completed_movies: int
    completed_anime: int
    completed_series: int
    episodes_watched: int
    total_hours: float
