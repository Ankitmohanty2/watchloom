"""Statistics API routes."""
from fastapi import APIRouter, Depends

from app.api.dependencies import CurrentUserId
from app.db.mongodb import get_database
from app.services.statistics_service import StatisticsService

router = APIRouter(prefix="/statistics", tags=["Statistics"])


@router.get("/me")
async def get_my_statistics(
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Get current user's statistics."""
    stats_service = StatisticsService(db)
    stats = await stats_service.get_user_statistics(current_user_id)
    return stats
