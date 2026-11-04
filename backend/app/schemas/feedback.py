"""Schemas for public Watchloom feedback."""
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class FeedbackUpsertRequest(BaseModel):
    """A signed-in user's public site comment."""

    comment: str = Field(min_length=20, max_length=500)
    public_consent: bool

    @field_validator("comment", mode="before")
    @classmethod
    def trim_comment(cls, value: object) -> object:
        if isinstance(value, str):
            return value.strip()
        return value

    @field_validator("public_consent")
    @classmethod
    def require_public_consent(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Confirm that your comment and display name may be shown publicly")
        return value


class FeedbackResponse(BaseModel):
    """Public-safe feedback fields; never includes account identifiers or email."""

    id: str
    author_name: str
    comment: str
    created_at: datetime
    updated_at: datetime
