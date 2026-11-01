"""User API routes."""
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.dependencies import CurrentUser, CurrentUserId
from app.db.mongodb import get_database
from app.repositories.user_repository import UserRepository
from app.schemas.common import SuccessResponse
from app.schemas.user import UpdatePreferencesRequest, UpdateUserRequest, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: CurrentUser):
    """Get current user profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_profile(
    request: UpdateUserRequest,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Update user profile."""
    user_repo = UserRepository(db)
    update_data = request.model_dump(exclude_unset=True)

    if update_data:
        user_doc = await user_repo.update(current_user_id, update_data)
        from app.models.user import UserModel

        return UserModel.to_dict(user_doc)

    return current_user_id


@router.patch("/me/preferences", response_model=UserResponse)
async def update_preferences(
    request: UpdatePreferencesRequest,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Update user preferences."""
    user_repo = UserRepository(db)
    update_data = {"preferences": request.model_dump(exclude_unset=True)}

    user_doc = await user_repo.update(current_user_id, update_data)
    from app.models.user import UserModel

    return UserModel.to_dict(user_doc)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Delete user account."""
    user_repo = UserRepository(db)
    await user_repo.delete(current_user_id)
