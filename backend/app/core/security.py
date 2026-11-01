"""Security utilities for authentication and password hashing."""
from datetime import UTC, datetime, timedelta
from typing import Any

import jwt
from pwdlib import PasswordHash
from pwdlib.hashers.argon2 import Argon2Hasher

from app.core.config import settings

# Password hasher using Argon2
pwd_context = PasswordHash((Argon2Hasher(),))


def hash_password(password: str) -> str:
    """Hash a password using Argon2."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(UTC) + expires_delta
    else:
        expire = datetime.now(UTC) + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict[str, Any]) -> str:
    """Create a JWT refresh token."""
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(days=settings.jwt_refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(
        to_encode, settings.refresh_token_secret, algorithm=settings.jwt_algorithm
    )


def decode_token(token: str, token_type: str = "access") -> dict[str, Any]:
    """Decode and validate a JWT token."""
    secret = (
        settings.jwt_secret_key if token_type == "access" else settings.refresh_token_secret
    )
    payload = jwt.decode(token, secret, algorithms=[settings.jwt_algorithm])

    # Verify token type
    if payload.get("type") != token_type:
        raise jwt.InvalidTokenError("Invalid token type")

    return payload


def create_verification_token(email: str) -> str:
    """Create a token for email verification."""
    expire = datetime.now(UTC) + timedelta(hours=24)
    to_encode = {"sub": email, "exp": expire, "type": "verification"}
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_verification_token(token: str) -> str | None:
    """Verify an email verification token and return the email."""
    try:
        payload = decode_token(token, token_type="access")
        if payload.get("type") != "verification":
            return None
        return payload.get("sub")
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
        return None


def create_password_reset_token(email: str) -> str:
    """Create a token for password reset."""
    expire = datetime.now(UTC) + timedelta(hours=1)
    to_encode = {"sub": email, "exp": expire, "type": "password_reset"}
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def verify_password_reset_token(token: str) -> str | None:
    """Verify a password reset token and return the email."""
    try:
        payload = decode_token(token, token_type="access")
        if payload.get("type") != "password_reset":
            return None
        return payload.get("sub")
    except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
        return None
