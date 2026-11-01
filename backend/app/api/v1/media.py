"""Media API routes."""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.exceptions import ExternalAPIError
from app.db.mongodb import get_database
from app.services.media_service import MediaService

router = APIRouter(prefix="/media", tags=["Media"])


@router.get("/search")
async def search_media(
    query: str = Query(..., min_length=1),
    media_type: str | None = None,
    page: int = Query(1, ge=1),
    db=Depends(get_database),
):
    """Search for media across all providers."""
    try:
        media_service = MediaService(db)
        results = await media_service.search(query, media_type, page)
        return results
    except ExternalAPIError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e)) from e


@router.get("/trending")
async def get_trending(
    media_type: str = "all",
    page: int = Query(1, ge=1),
    db=Depends(get_database),
):
    """Get trending media."""
    try:
        media_service = MediaService(db)
        results = await media_service.get_trending(media_type, page)
        return results
    except ExternalAPIError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e)) from e


@router.get("/popular")
async def get_popular(
    media_type: str = Query(...),
    page: int = Query(1, ge=1),
    db=Depends(get_database),
):
    """Get popular media by type."""
    try:
        media_service = MediaService(db)
        results = await media_service.get_popular(media_type, page)
        return results
    except ExternalAPIError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e)) from e


@router.get("/genres")
async def get_genres(
    media_type: str = "movie",
    db=Depends(get_database),
):
    """Get genres for media type."""
    try:
        media_service = MediaService(db)
        genres = await media_service.get_genres(media_type)
        return {"genres": genres}
    except ExternalAPIError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e)) from e


@router.get("/trailer/{provider}/{provider_id}")
async def get_media_trailer(
    provider: str,
    provider_id: int,
    media_type: str = Query(...),
    db=Depends(get_database),
):
    """Resolve a YouTube trailer for a media provider title."""
    try:
        media_service = MediaService(db)
        trailer_url = await media_service.get_trailer_url(provider, provider_id, media_type)
        return {"trailer_url": trailer_url}
    except ExternalAPIError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e)) from e


@router.get("/similar/{provider}/{provider_id}")
async def get_similar_media(
    provider: str,
    provider_id: int,
    media_type: str = Query(...),
    page: int = Query(1, ge=1),
    db=Depends(get_database),
):
    """Get similar titles from the title's source provider."""
    try:
        media_service = MediaService(db)
        return await media_service.get_similar_media(provider, provider_id, media_type, page)
    except ExternalAPIError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e)) from e

@router.get("/{media_id}")
async def get_media_details(
    media_id: str,
    db=Depends(get_database),
):
    """Get media details."""
    media_service = MediaService(db)
    media = await media_service.get_media_details(media_id)
    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Media not found")
    return media


@router.post("/fetch")
async def fetch_and_store_media(
    provider: str = Query(...),
    provider_id: int = Query(...),
    media_type: str = Query(...),
    db=Depends(get_database),
):
    """Fetch media from provider and store in database."""
    try:
        media_service = MediaService(db)
        media = await media_service.get_or_create_media(provider, provider_id, media_type)
        return media
    except ExternalAPIError as e:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(e)) from e


