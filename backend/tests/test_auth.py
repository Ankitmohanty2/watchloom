"""Tests for authentication endpoints."""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    """Test user registration."""
    data = {
        "display_name": "New User",
        "username": "newuser",
        "email": "new@example.com",
        "password": "SecurePass123!",
        "confirm_password": "SecurePass123!",
    }
    response = await client.post("/api/v1/auth/signup", json=data)
    assert response.status_code == 201
    result = response.json()
    assert "access_token" in result
    assert "user" in result
    assert result["user"]["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient):
    """Test registration with duplicate email."""
    data = {
        "display_name": "User One",
        "username": "user1",
        "email": "duplicate@example.com",
        "password": "Pass123!",
        "confirm_password": "Pass123!",
    }
    # First registration
    response1 = await client.post("/api/v1/auth/signup", json=data)
    assert response1.status_code == 201

    # Second registration with same email
    data2 = {
        "display_name": "User Two",
        "username": "user2",
        "email": "duplicate@example.com",
        "password": "Pass123!",
        "confirm_password": "Pass123!",
    }
    response2 = await client.post("/api/v1/auth/signup", json=data2)
    assert response2.status_code == 409


@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    """Test user login."""
    # First register
    register_data = {
        "display_name": "Login User",
        "username": "loginuser",
        "email": "login@example.com",
        "password": "LoginPass123!",
        "confirm_password": "LoginPass123!",
    }
    await client.post("/api/v1/auth/signup", json=register_data)

    # Then login
    login_data = {"email_or_username": "login@example.com", "password": "LoginPass123!"}
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 200
    result = response.json()
    assert "access_token" in result


@pytest.mark.asyncio
async def test_login_invalid_credentials(client: AsyncClient):
    """Test login with invalid credentials."""
    login_data = {"email_or_username": "nonexistent@example.com", "password": "WrongPass"}
    response = await client.post("/api/v1/auth/login", json=login_data)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers):
    """Test get current user."""
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    result = response.json()
    assert "email" in result


@pytest.mark.asyncio
async def test_get_me_unauthorized(client: AsyncClient):
    """Test get current user without authentication."""
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 403  # No credentials provided
