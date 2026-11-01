"""Authentication service."""
import hashlib

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import AuthenticationError, ConflictError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.session import SessionModel
from app.models.user import UserModel
from app.repositories.user_repository import UserRepository


class AuthService:
    """Service for authentication operations."""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.user_repo = UserRepository(db)
        self.refresh_tokens = db.refresh_tokens

    async def register(
        self, display_name: str, username: str, email: str, password: str
    ) -> dict:
        """Register a new user."""
        # Check if user already exists
        existing_user = await self.user_repo.find_by_email(email)
        if existing_user:
            raise ConflictError("Email already registered")

        existing_username = await self.user_repo.find_by_username(username)
        if existing_username:
            raise ConflictError("Username already taken")

        # Hash password
        password_hash = hash_password(password)

        # Create user
        user_data = UserModel.create(display_name, username, email, password_hash)
        user_doc = await self.user_repo.create(user_data)

        # Generate tokens
        user_id = str(user_doc["_id"])
        access_token = create_access_token({"sub": user_id})
        refresh_token = create_refresh_token({"sub": user_id})

        # Store refresh token
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        session_data = SessionModel.create(user_id, token_hash)
        await self.refresh_tokens.insert_one(session_data)

        return {
            "user": UserModel.to_dict(user_doc),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    async def login(self, email_or_username: str, password: str) -> dict:
        """Authenticate user and return tokens."""
        # Find user
        user_doc = await self.user_repo.find_by_email_or_username(email_or_username)
        if not user_doc:
            raise AuthenticationError("Invalid credentials")

        # Verify password
        if not verify_password(password, user_doc["password_hash"]):
            raise AuthenticationError("Invalid credentials")

        # Generate tokens
        user_id = str(user_doc["_id"])
        access_token = create_access_token({"sub": user_id})
        refresh_token = create_refresh_token({"sub": user_id})

        # Store refresh token
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        session_data = SessionModel.create(user_id, token_hash)
        await self.refresh_tokens.insert_one(session_data)

        return {
            "user": UserModel.to_dict(user_doc),
            "access_token": access_token,
            "refresh_token": refresh_token,
        }

    async def refresh_access_token(self, refresh_token: str) -> dict:
        """Refresh access token using refresh token."""
        from app.core.security import decode_token

        try:
            payload = decode_token(refresh_token, token_type="refresh")
            user_id = payload.get("sub")

            # Verify refresh token exists and is not revoked
            token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
            session = await self.refresh_tokens.find_one(
                {"token_hash": token_hash, "revoked": False}
            )

            if not session:
                raise AuthenticationError("Invalid refresh token")

            # Generate new tokens
            new_access_token = create_access_token({"sub": user_id})
            new_refresh_token = create_refresh_token({"sub": user_id})

            # Revoke old refresh token
            await self.refresh_tokens.update_one(
                {"token_hash": token_hash}, {"$set": {"revoked": True}}
            )

            # Store new refresh token
            new_token_hash = hashlib.sha256(new_refresh_token.encode()).hexdigest()
            new_session_data = SessionModel.create(user_id, new_token_hash)
            await self.refresh_tokens.insert_one(new_session_data)

            return {
                "access_token": new_access_token,
                "refresh_token": new_refresh_token,
            }
        except Exception as e:
            raise AuthenticationError("Invalid refresh token") from e

    async def logout(self, refresh_token: str) -> None:
        """Revoke refresh token."""
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        await self.refresh_tokens.update_one(
            {"token_hash": token_hash}, {"$set": {"revoked": True}}
        )

    async def get_current_user(self, user_id: str) -> dict:
        """Get current authenticated user."""
        user_doc = await self.user_repo.find_by_id(user_id)
        if not user_doc:
            raise AuthenticationError("User not found")
        return UserModel.to_dict(user_doc)
