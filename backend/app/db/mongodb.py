"""MongoDB connection and database management."""
from typing import Any

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ServerSelectionTimeoutError

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class MongoDB:
    """MongoDB connection manager."""

    client: AsyncIOMotorClient | None = None
    database: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        """Connect to MongoDB."""
        try:
            self.client = AsyncIOMotorClient(
                settings.mongodb_uri,
                serverSelectionTimeoutMS=5000,
            )
            # Verify connection
            await self.client.admin.command("ping")
            self.database = self.client[settings.database_name]
            logger.info(f"Connected to MongoDB: {settings.database_name}")
        except ServerSelectionTimeoutError as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise

    async def disconnect(self) -> None:
        """Disconnect from MongoDB."""
        if self.client:
            self.client.close()
            logger.info("Disconnected from MongoDB")

    def get_database(self) -> AsyncIOMotorDatabase:
        """Get the database instance."""
        if self.database is None:
            raise RuntimeError("Database not connected")
        return self.database

    def get_collection(self, name: str) -> Any:
        """Get a collection from the database."""
        return self.get_database()[name]


# Global MongoDB instance
mongodb = MongoDB()


async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance."""
    return mongodb.get_database()
