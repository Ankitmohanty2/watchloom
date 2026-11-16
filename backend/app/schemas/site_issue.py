"""Schemas for public site improvement reports."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

IssueCategory = Literal["bug", "feature", "performance", "other"]


class SiteIssueCreateRequest(BaseModel):
    """Visitor-submitted improvement or bug report."""

    message: str = Field(..., min_length=10, max_length=2000)
    category: IssueCategory = "other"
    contact_email: EmailStr | None = None
    page_path: str | None = Field(default=None, max_length=500)
    # Honeypot field; bots often fill hidden inputs.
    company_website: str | None = Field(default=None, max_length=200)


class SiteIssueCreateResponse(BaseModel):
    """Acknowledgement after a report is stored."""

    id: str
    message: str = "Thanks — your suggestion was received."


class SiteIssueResponse(BaseModel):
    """Stored issue shape for internal use."""

    id: str
    category: IssueCategory
    message: str
    contact_email: str | None
    page_path: str | None
    user_id: str | None
    status: str
    created_at: datetime