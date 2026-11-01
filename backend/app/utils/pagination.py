"""Pagination utilities."""


def get_skip_limit(page: int, limit: int) -> tuple[int, int]:
    """Calculate skip and limit for pagination."""
    skip = (page - 1) * limit
    return skip, limit


def calculate_total_pages(total: int, limit: int) -> int:
    """Calculate total number of pages."""
    return (total + limit - 1) // limit
