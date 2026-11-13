"""Main FastAPI application."""
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import get_logger, setup_logging
from app.db.indexes import create_indexes
from app.db.mongodb import mongodb
from app.integrations.anilist_client import anilist_client
from app.integrations.tmdb_client import tmdb_client

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events for the application."""
    # Startup
    logger.info("Starting up...")
    try:
        await mongodb.connect()
        logger.info("Application started successfully")
    except Exception as e:
        logger.error(f"Failed to start application: {e}")
        raise

    # Index creation is idempotent and can take several round trips to the database.
    # Running it in the background lets a cold-started instance serve requests sooner.
    index_task = asyncio.create_task(_ensure_indexes())

    yield

    # Shutdown
    logger.info("Shutting down...")
    index_task.cancel()
    await tmdb_client.aclose()
    await anilist_client.aclose()
    await mongodb.disconnect()
    logger.info("Application shutdown complete")


async def _ensure_indexes() -> None:
    """Create database indexes without blocking startup."""
    try:
        await create_indexes(mongodb.get_database())
    except asyncio.CancelledError:
        raise
    except Exception as e:
        logger.error(f"Failed to create database indexes: {e}")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="API for Universal Entertainment Tracker",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """Handle application exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )


# Health check
# Catalog responses are public and identical for every visitor, so browsers may
# reuse them briefly instead of asking the API again on every page visit.
PUBLIC_CATALOG_PREFIX = "/api/v1/media/"
PUBLIC_CATALOG_MAX_AGE = 300


@app.middleware("http")
async def cache_public_catalog(request: Request, call_next):
    """Add a short browser cache lifetime to successful catalog reads."""
    response = await call_next(request)
    if (
        request.method == "GET"
        and response.status_code == status.HTTP_200_OK
        and request.url.path.startswith(PUBLIC_CATALOG_PREFIX)
        and "cache-control" not in response.headers
    ):
        response.headers["Cache-Control"] = f"public, max-age={PUBLIC_CATALOG_MAX_AGE}"
    return response


# Health check. HEAD is accepted because uptime monitors commonly use it.
@app.api_route("/health", methods=["GET", "HEAD"], tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "environment": settings.environment}


# Include API router
app.include_router(api_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.backend_port,
        reload=not settings.is_production,
    )
