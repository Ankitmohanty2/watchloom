"""Persistence for visitor-submitted site improvement issues."""

from typing import Any

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.site_issue import SiteIssueModel


class SiteIssueRepository:
    """Store improvement and bug reports."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db.site_issues

    async def insert(self, document: dict[str, Any]) -> dict[str, Any]:
        result = await self.collection.insert_one(document)
        stored = await self.collection.find_one({"_id": result.inserted_id})
        assert stored is not None
        return SiteIssueModel.to_dict(stored)