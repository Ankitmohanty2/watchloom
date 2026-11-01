"""Main API router."""
from fastapi import APIRouter

from app.api.v1 import auth, library, media, progress, statistics, users

api_router = APIRouter(prefix="/api/v1")

# Include all route modules
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(media.router)
api_router.include_router(library.router)
api_router.include_router(progress.router)
api_router.include_router(statistics.router)
