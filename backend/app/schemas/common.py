"""Common Pydantic schemas."""
from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    """Pagination parameters."""

    page: int = Field(default=1, ge=1, description="Page number")
    limit: int = Field(default=20, ge=1, le=100, description="Items per page")


class PaginatedResponse(BaseModel):
    """Paginated response wrapper."""

    items: list
    total: int
    page: int
    limit: int
    total_pages: int

    @classmethod
    def create(cls, items: list, total: int, page: int, limit: int):
        """Create paginated response."""
        total_pages = (total + limit - 1) // limit
        return cls(
            items=items,
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
        )


class SuccessResponse(BaseModel):
    """Generic success response."""

    success: bool = True
    message: str


class ErrorResponse(BaseModel):
    """Error response schema."""

    detail: str
