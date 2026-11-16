"""Handle site improvement reports and optional owner notifications."""

import logging

from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.config import settings
from app.models.site_issue import SiteIssueModel
from app.repositories.site_issue_repository import SiteIssueRepository
from app.schemas.site_issue import SiteIssueCreateRequest
from app.services.email_service import EmailService

logger = logging.getLogger(__name__)


class SiteIssueService:
    """Persist reports and notify the site owner when email is configured."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.repo = SiteIssueRepository(db)
        self.email_service = EmailService()

    async def create(
        self,
        request: SiteIssueCreateRequest,
        *,
        user_id: str | None,
    ) -> dict:
        document = SiteIssueModel.create(
            message=request.message,
            category=request.category,
            contact_email=str(request.contact_email) if request.contact_email else None,
            page_path=(request.page_path or "").strip() or None,
            user_id=user_id,
        )
        issue = await self.repo.insert(document)
        await self._notify_owner(issue)
        return issue

    async def _notify_owner(self, issue: dict) -> None:
        recipient = (settings.site_issue_notify_email or "").strip()
        if not recipient:
            return

        lines = [
            "New Watchloom improvement report",
            "",
            f"Issue ID: {issue['id']}",
            f"Category: {issue['category']}",
            f"Page: {issue.get('page_path') or '(not provided)'}",
            f"Reporter email: {issue.get('contact_email') or '(not provided)'}",
            f"Signed-in user: {issue.get('user_id') or '(anonymous)'}",
            "",
            "Message:",
            issue["message"],
        ]
        subject = f"[Watchloom] {issue['category']} report"
        try:
            await self.email_service.send_plain_notification(
                recipient=recipient,
                subject=subject,
                body="\n".join(lines),
            )
        except Exception as error:
            logger.warning("Site issue saved but owner notification failed: %s", error)


async def create_site_issue(
    db: AsyncIOMotorDatabase,
    request: SiteIssueCreateRequest,
    *,
    user_id: str | None,
) -> dict:
    """Convenience wrapper for route handlers."""
    return await SiteIssueService(db).create(request, user_id=user_id)