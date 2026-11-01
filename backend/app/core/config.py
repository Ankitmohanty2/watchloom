"""Application configuration using Pydantic Settings."""
from typing import Any

from pydantic import field_validator, MongoDsn
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "Universal Entertainment Tracker"
    environment: str = "development"
    backend_port: int = 8000

    # Database
    mongodb_uri: str
    database_name: str = "entertainment_tracker"

    # JWT
    jwt_secret_key: str
    refresh_token_secret: str
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7
    jwt_algorithm: str = "HS256"

    # External APIs
    tmdb_api_key: str
    anilist_api_url: str = "https://graphql.anilist.co"

    # CORS
    frontend_url: str = "http://localhost:5173"
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> list[str]:
        """Parse CORS origins from string or list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # Cookies
    cookie_secure: bool = False
    cookie_httponly: bool = True
    cookie_samesite: str = "lax"

    # Rate Limiting
    rate_limit_per_minute: int = 60
    auth_rate_limit_per_minute: int = 5

    @property
    def is_production(self) -> bool:
        """Check if running in production."""
        return self.environment == "production"


# Global settings instance
settings = Settings()
