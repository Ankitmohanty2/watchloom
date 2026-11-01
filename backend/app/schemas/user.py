"""User Pydantic schemas."""

from pydantic import BaseModel, Field


class UserPreferences(BaseModel):
    """User preferences schema."""

    theme: str = "light"
    default_view: str = "grid"
    favorite_genres: list[str] = []
    preferred_languages: list[str] = ["en"]


class UserPrivacySettings(BaseModel):
    """User privacy settings schema."""

    profile_public: bool = False
    library_public: bool = False


class UserResponse(BaseModel):
    """User response schema."""

    id: str
    display_name: str
    username: str
    email: str
    email_verified: bool
    avatar: str | None = None
    preferences: UserPreferences
    privacy_settings: UserPrivacySettings
    created_at: str
    updated_at: str


class UpdateUserRequest(BaseModel):
    """Update user profile request."""

    display_name: str | None = Field(None, min_length=2, max_length=50)
    avatar: str | None = None


class UpdatePreferencesRequest(BaseModel):
    """Update user preferences request."""

    theme: str | None = None
    default_view: str | None = None
    favorite_genres: list[str] | None = None
    preferred_languages: list[str] | None = None


class UpdatePrivacyRequest(BaseModel):
    """Update privacy settings request."""

    profile_public: bool | None = None
    library_public: bool | None = None
