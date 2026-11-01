"""Library API routes."""
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import CurrentUserId
from app.core.exceptions import ConflictError, NotFoundError
from app.db.mongodb import get_database
from app.schemas.common import SuccessResponse
from app.schemas.library import (
    AddToLibraryRequest,
    BulkUpdateRequest,
    LibraryFilterParams,
    LibraryResponse,
    LibraryStatsResponse,
    UpdateLibraryRequest,
)
from app.services.library_service import LibraryService

router = APIRouter(prefix="/library", tags=["Library"])


@router.get("")
async def get_library(
    current_user_id: CurrentUserId,
    status: str | None = None,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    sort_by: str = "updated_at",
    db=Depends(get_database),
):
    """Get user's library."""
    library_service = LibraryService(db)
    result = await library_service.get_user_library(current_user_id, status, page, limit, sort_by)
    return result


@router.post("", response_model=LibraryResponse, status_code=status.HTTP_201_CREATED)
async def add_to_library(
    request: AddToLibraryRequest,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Add media to library."""
    try:
        library_service = LibraryService(db)
        result = await library_service.add_to_library(
            current_user_id, request.media_id, request.status
        )
        return result
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{item_id}", response_model=LibraryResponse)
async def update_library_entry(
    item_id: str,
    request: UpdateLibraryRequest,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Update library entry."""
    try:
        library_service = LibraryService(db)
        update_data = request.model_dump(exclude_unset=True)
        result = await library_service.update_library_entry(item_id, current_user_id, update_data)
        return result
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_library(
    item_id: str,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Remove media from library."""
    try:
        library_service = LibraryService(db)
        await library_service.remove_from_library(item_id, current_user_id)
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/bulk-update", response_model=SuccessResponse)
async def bulk_update_library(
    request: BulkUpdateRequest,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Bulk update library entries."""
    library_service = LibraryService(db)
    update_data = request.model_dump(exclude={"item_ids"}, exclude_unset=True)
    count = await library_service.bulk_update(request.item_ids, current_user_id, update_data)
    return SuccessResponse(message=f"Updated {count} items")


@router.get("/stats")
async def get_library_stats(
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Get library statistics."""
    library_service = LibraryService(db)
    stats = await library_service.get_library_stats(current_user_id)

    # Add episode stats
    from app.services.progress_service import ProgressService

    progress_service = ProgressService(db)
    total_episodes = await progress_service.progress_repo.get_total_episodes_watched(
        current_user_id
    )

    stats["episodes_watched"] = total_episodes
    stats["total_hours"] = round((total_episodes * 25) / 60, 1)

    return stats
