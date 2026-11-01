"""Database indexes configuration."""
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING, IndexModel

from app.core.logging import get_logger

logger = get_logger(__name__)


async def create_indexes(db: AsyncIOMotorDatabase) -> None:
    """Create all database indexes."""
    logger.info("Creating database indexes...")

    # Users collection indexes
    users_indexes = [
        IndexModel([("email", ASCENDING)], unique=True, name="email_unique"),
        IndexModel([("username", ASCENDING)], unique=True, name="username_unique"),
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
    ]
    await db.users.create_indexes(users_indexes)
    logger.info("Created users indexes")

    # Media collection indexes
    media_indexes = [
        IndexModel([("media_type", ASCENDING)], name="media_type"),
        IndexModel([("provider_ids.tmdb_id", ASCENDING)], name="tmdb_id"),
        IndexModel([("provider_ids.anilist_id", ASCENDING)], name="anilist_id"),
        IndexModel([("title", "text"), ("original_title", "text")], name="title_text_search"),
        IndexModel([("genres", ASCENDING)], name="genres"),
        IndexModel([("release_date", DESCENDING)], name="release_date_desc"),
        IndexModel([("rating", DESCENDING)], name="rating_desc"),
    ]
    await db.media.create_indexes(media_indexes)
    logger.info("Created media indexes")

    # User library collection indexes
    library_indexes = [
        IndexModel(
            [("user_id", ASCENDING), ("media_id", ASCENDING)],
            unique=True,
            name="user_media_unique",
        ),
        IndexModel([("user_id", ASCENDING), ("status", ASCENDING)], name="user_status"),
        IndexModel([("user_id", ASCENDING), ("added_at", DESCENDING)], name="user_added_at"),
        IndexModel(
            [("user_id", ASCENDING), ("updated_at", DESCENDING)], name="user_updated_at"
        ),
    ]
    await db.user_library.create_indexes(library_indexes)
    logger.info("Created user_library indexes")

    # Episode progress collection indexes
    progress_indexes = [
        IndexModel(
            [
                ("user_id", ASCENDING),
                ("media_id", ASCENDING),
                ("season_number", ASCENDING),
                ("episode_number", ASCENDING),
            ],
            unique=True,
            name="episode_unique",
        ),
        IndexModel([("user_id", ASCENDING), ("media_id", ASCENDING)], name="user_media"),
        IndexModel([("user_id", ASCENDING), ("watched_at", DESCENDING)], name="user_watched_at"),
    ]
    await db.episode_progress.create_indexes(progress_indexes)
    logger.info("Created episode_progress indexes")

    # Refresh tokens collection indexes (with TTL)
    token_indexes = [
        IndexModel([("user_id", ASCENDING)], name="user_id"),
        IndexModel([("token_hash", ASCENDING)], unique=True, name="token_hash_unique"),
        IndexModel([("expires_at", ASCENDING)], expireAfterSeconds=0, name="expires_at_ttl"),
    ]
    await db.refresh_tokens.create_indexes(token_indexes)
    logger.info("Created refresh_tokens indexes")

    # Password reset tokens (with TTL)
    reset_indexes = [
        IndexModel([("email", ASCENDING)], name="email"),
        IndexModel([("token_hash", ASCENDING)], unique=True, name="token_hash_unique"),
        IndexModel([("expires_at", ASCENDING)], expireAfterSeconds=0, name="expires_at_ttl"),
    ]
    await db.password_reset_tokens.create_indexes(reset_indexes)
    logger.info("Created password_reset_tokens indexes")

    # Email verification tokens (with TTL)
    verification_indexes = [
        IndexModel([("email", ASCENDING)], name="email"),
        IndexModel([("token_hash", ASCENDING)], unique=True, name="token_hash_unique"),
        IndexModel([("expires_at", ASCENDING)], expireAfterSeconds=0, name="expires_at_ttl"),
    ]
    await db.email_verification_tokens.create_indexes(verification_indexes)
    logger.info("Created email_verification_tokens indexes")

    logger.info("All indexes created successfully")
