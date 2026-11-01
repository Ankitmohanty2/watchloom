"""Authentication API routes."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import AuthServiceDep, CurrentUser
from app.core.exceptions import AuthenticationError, ConflictError, ValidationError
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RefreshTokenRequest,
    ResetPasswordRequest,
    SignUpRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
async def signup(
    request: SignUpRequest,
    auth_service: AuthServiceDep,
):
    """Register a new user."""
    try:
        result = await auth_service.register(
            display_name=request.display_name,
            username=request.username,
            email=request.email,
            password=request.password,
        )
        return {
            "user": result["user"],
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": "bearer",
        }
    except ConflictError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))


@router.post("/login", response_model=dict)
async def login(
    request: LoginRequest,
    auth_service: AuthServiceDep,
):
    """Authenticate user and return tokens."""
    try:
        result = await auth_service.login(
            email_or_username=request.email_or_username,
            password=request.password,
        )
        return {
            "user": result["user"],
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": "bearer",
        }
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    auth_service: AuthServiceDep,
):
    """Refresh access token."""
    try:
        result = await auth_service.refresh_access_token(request.refresh_token)
        return TokenResponse(**result)
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: RefreshTokenRequest,
    auth_service: AuthServiceDep,
):
    """Logout user and revoke refresh token."""
    try:
        await auth_service.logout(request.refresh_token)
    except Exception:
        pass  # Silent failure on logout


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser):
    """Get current authenticated user."""
    return current_user


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset email."""
    # TODO: Implement email sending
    return {"message": "Password reset email sent if account exists"}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token."""
    # TODO: Implement password reset
    return {"message": "Password reset successful"}
