"""Episode progress API routes."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import CurrentUserId
from app.core.exceptions import NotFoundError
from app.db.mongodb import get_database
from app.schemas.progress import EpisodeProgressResponse, MarkEpisodeRequest, MediaProgressResponse
from app.services.progress_service import ProgressService

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/{media_id}", response_model=MediaProgressResponse)
async def get_media_progress(
    media_id: str,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Get episode progress for a media."""
    progress_service = ProgressService(db)
    progress = await progress_service.get_media_progress(current_user_id, media_id)
    return progress


@router.post("/{media_id}/episodes", response_model=EpisodeProgressResponse, status_code=status.HTTP_201_CREATED)
async def mark_episode_watched(
    media_id: str,
    request: MarkEpisodeRequest,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Mark an episode as watched."""
    progress_service = ProgressService(db)
    result = await progress_service.mark_episode_watched(
        current_user_id, media_id, request.season_number, request.episode_number
    )
    return result


@router.delete("/{media_id}/episodes/{season_number}/{episode_number}", status_code=status.HTTP_204_NO_CONTENT)
async def unmark_episode(
    media_id: str,
    season_number: int,
    episode_number: int,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Remove episode watch record."""
    try:
        progress_service = ProgressService(db)
        await progress_service.unmark_episode(
            current_user_id, media_id, season_number, episode_number
        )
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/continue-watching")
async def get_continue_watching(
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Get continue watching list."""
    progress_service = ProgressService(db)
    results = await progress_service.get_continue_watching(current_user_id)
    return {"results": results}
