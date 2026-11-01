"""Pytest configuration and fixtures."""
import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.main import app


# Event loop fixture
@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


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
async def client() -> AsyncGenerator:
    """Create test HTTP client."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac


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
