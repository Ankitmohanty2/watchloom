"""Public comments and authenticated feedback management."""
from fastapi import APIRouter, Depends, Query, status

from app.api.dependencies import CurrentUser, CurrentUserId
from app.db.mongodb import get_database
from app.models.feedback import FeedbackModel
from app.repositories.feedback_repository import FeedbackRepository
from app.schemas.feedback import FeedbackResponse, FeedbackUpsertRequest

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.get("", response_model=list[FeedbackResponse])
async def list_public_feedback(
    limit: int = Query(default=8, ge=1, le=20),
    db=Depends(get_database),
):
    """List only comments that were explicitly approved for public display."""
    feedback = await FeedbackRepository(db).list_public(limit)
    return [FeedbackModel.to_dict(item) for item in feedback]


@router.get("/me", response_model=FeedbackResponse | None)
async def get_my_feedback(
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Get the signed-in user's current public comment, if one exists."""
    feedback = await FeedbackRepository(db).find_by_user(current_user_id)
    return FeedbackModel.to_dict(feedback) if feedback else None


@router.put("/me", response_model=FeedbackResponse)
async def save_my_feedback(
    request: FeedbackUpsertRequest,
    current_user: CurrentUser,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Create or update a comment after the user confirms public display."""
    feedback = await FeedbackRepository(db).upsert(
        user_id=current_user_id,
        author_name=current_user["display_name"],
        comment=request.comment,
    )
    return FeedbackModel.to_dict(feedback)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_feedback(
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Remove the signed-in user's public comment."""
    await FeedbackRepository(db).delete_by_user(current_user_id)
