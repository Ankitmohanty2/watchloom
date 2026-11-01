"""Pytest configuration and fixtures."""
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.db.mongodb import get_database
from app.main import app


# Test database
@pytest_asyncio.fixture(scope="function")
async def test_db():
    """Create test database."""
    # Use a separate test database
    test_db_name = f"{settings.database_name}_test"
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[test_db_name]

    yield db

    # Cleanup: drop test database
    await client.drop_database(test_db_name)
    client.close()


# HTTP client fixture
@pytest_asyncio.fixture(scope="function")
async def client(test_db) -> AsyncGenerator:
    """Create test HTTP client."""
    async def override_get_database():
        return test_db

    app.dependency_overrides[get_database] = override_get_database
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            yield ac
    finally:
        app.dependency_overrides.pop(get_database, None)


# Helper fixture for authenticated requests
@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient):
    """Create authenticated user and return auth headers."""
    # Register a test user
    register_data = {
        "display_name": "Test User",
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123!",
        "confirm_password": "TestPass123!",
    }
    response = await client.post("/api/v1/auth/signup", json=register_data)
    assert response.status_code == 201
    data = response.json()

    access_token = data["access_token"]
    return {"Authorization": f"Bearer {access_token}"}
