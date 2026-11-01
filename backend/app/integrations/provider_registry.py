"""Provider registry for managing external API clients."""
from app.integrations.anilist_client import anilist_client
from app.integrations.tmdb_client import tmdb_client


class ProviderRegistry:
    """Registry for managing media providers."""

    def __init__(self):
        self.tmdb = tmdb_client
        self.anilist = anilist_client

    def get_provider(self, provider_name: str):
        """Get provider client by name."""
        return getattr(self, provider_name, None)


# Global registry instance
provider_registry = ProviderRegistry()
