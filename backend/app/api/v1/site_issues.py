"""Public site improvement and bug reports."""

from typing import Annotated

import jwt
from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.db.mongodb import get_database
from app.schemas.site_issue import SiteIssueCreateRequest, SiteIssueCreateResponse
from app.services.site_issue_service import create_site_issue

router = APIRouter(prefix="/issues", tags=["Site issues"])

_optional_bearer = HTTPBearer(auto_error=False)


async def get_optional_user_id(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_optional_bearer)],
) -> str | None:
    if credentials is None:
        return None
    try:
        payload = decode_token(credentials.credentials, token_type="access")
        user_id = payload.get("sub")
        return str(user_id) if user_id else None
    except jwt.InvalidTokenError:
        return None


@router.post("", response_model=SiteIssueCreateResponse, status_code=status.HTTP_201_CREATED)
async def submit_site_issue(
    request: SiteIssueCreateRequest,
    user_id: Annotated[str | None, Depends(get_optional_user_id)],
    db=Depends(get_database),
):
    """Store a visitor improvement report. Optionally links a signed-in account."""
    if (request.company_website or "").strip():
        return SiteIssueCreateResponse(id="0" * 24)

    issue = await create_site_issue(db, request, user_id=user_id)
    return SiteIssueCreateResponse(id=issue["id"])