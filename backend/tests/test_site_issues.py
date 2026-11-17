"""Site improvement issue submissions."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_submit_site_issue_anonymous(client: AsyncClient):
    response = await client.post(
        "/api/v1/issues",
        json={
            "message": "The home hero loads the video on top of the poster.",
            "category": "bug",
            "page_path": "/",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["id"]
    assert "received" in body["message"].lower()


@pytest.mark.asyncio
async def test_submit_site_issue_rejects_short_message(client: AsyncClient):
    response = await client.post(
        "/api/v1/issues",
        json={"message": "too short", "category": "other"},
    )
    assert response.status_code == 422
