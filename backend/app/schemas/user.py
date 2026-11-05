"""User Pydantic schemas."""

from pydantic import BaseModel, Field, field_validator


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


class ChangePasswordRequest(BaseModel):
    """Password update request verified with the account email OTP."""

    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str = Field(..., min_length=8, max_length=100)

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, value: str, info) -> str:
        """Require matching password values."""
        if "password" in info.data and value != info.data["password"]:
            raise ValueError("Passwords do not match")
        return value


class VerifyEmailCodeRequest(BaseModel):
    """Email ownership verification code submission."""

    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
