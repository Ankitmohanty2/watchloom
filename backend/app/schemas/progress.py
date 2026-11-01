"""Episode progress Pydantic schemas."""
from pydantic import BaseModel, Field


class MarkEpisodeRequest(BaseModel):
    """Mark episode as watched request."""

    season_number: int = Field(..., ge=0)
    episode_number: int = Field(..., ge=1)


class EpisodeProgressResponse(BaseModel):
    """Episode progress response schema."""

    id: str
    user_id: str
    media_id: str
    season_number: int
    episode_number: int
    watched_at: str
    updated_at: str


class MediaProgressResponse(BaseModel):
    """Media progress summary response."""

    media_id: str
    total_episodes_watched: int
    episodes: list[EpisodeProgressResponse]
    progress_percentage: float | None = None


class ContinueWatchingResponse(BaseModel):
    """Continue watching response."""

    media_id: str
    title: str
    poster_path: str | None = None
    last_watched_episode: EpisodeProgressResponse
    next_episode: dict | None = None
