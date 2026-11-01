"""Custom exceptions for the application."""


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class AuthenticationError(AppException):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status_code=401)


class AuthorizationError(AppException):
    """Raised when user is not authorized to perform an action."""

    def __init__(self, message: str = "Not authorized"):
        super().__init__(message, status_code=403)


class NotFoundError(AppException):
    """Raised when a resource is not found."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class ValidationError(AppException):
    """Raised when validation fails."""

    def __init__(self, message: str = "Validation error"):
        super().__init__(message, status_code=422)


class ConflictError(AppException):
    """Raised when a resource conflict occurs."""

    def __init__(self, message: str = "Resource conflict"):
        super().__init__(message, status_code=409)


class ExternalAPIError(AppException):
    """Raised when an external API call fails."""

    def __init__(self, message: str = "External API error", status_code: int = 502):
        super().__init__(message, status_code=status_code)


class RateLimitError(AppException):
    """Raised when rate limit is exceeded."""

    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(message, status_code=429)
