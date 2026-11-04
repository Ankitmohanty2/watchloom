"""User API routes."""
import base64

from bson import ObjectId
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies import CurrentUser, CurrentUserId
from app.db.mongodb import get_database
from app.models.user import UserModel
from app.repositories.feedback_repository import FeedbackRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import ChangePasswordRequest, UpdatePreferencesRequest, UpdateUserRequest, UserResponse
from app.services.password_change_service import PasswordChangeService

router = APIRouter(prefix="/users", tags=["Users"])
MAX_AVATAR_BYTES = 2 * 1024 * 1024
AVATAR_SIGNATURES = {
    "image/jpeg": lambda content: content.startswith(b"\xff\xd8\xff"),
    "image/png": lambda content: content.startswith(b"\x89PNG\r\n\x1a\n"),
    "image/webp": lambda content: len(content) >= 12 and content.startswith(b"RIFF") and content[8:12] == b"WEBP",
}


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
    return UserModel.to_dict(user_doc)


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    current_user_id: CurrentUserId,
    file: UploadFile = File(...),
    db=Depends(get_database),
):
    """Save a small raster profile image with the account document."""
    content_type = (file.content_type or "").lower()
    signature_check = AVATAR_SIGNATURES.get(content_type)
    if not signature_check:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Choose a JPEG, PNG, or WebP image.",
        )

    image_content = await file.read(MAX_AVATAR_BYTES + 1)
    if len(image_content) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Profile images must be 2 MB or smaller.",
        )
    if not signature_check(image_content):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="The uploaded file does not match its image format.",
        )

    avatar_data = f"data:{content_type};base64,{base64.b64encode(image_content).decode('ascii')}"
    user_doc = await UserRepository(db).update(current_user_id, {"avatar": avatar_data})
    return UserModel.to_dict(user_doc)


@router.post("/me/password/code", status_code=status.HTTP_202_ACCEPTED)
async def request_password_change_code(
    current_user: CurrentUser,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Send a password change code to the signed-in user's email."""
    service = PasswordChangeService(db)
    await service.request_code(current_user_id, current_user["email"])
    return {"message": "A verification code was sent to your account email."}


@router.put("/me/password", status_code=status.HTTP_200_OK)
async def change_password(
    request: ChangePasswordRequest,
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Change the signed-in user's password after verifying the email code."""
    service = PasswordChangeService(db)
    await service.change_password(current_user_id, request.code, request.password)
    return {"message": "Your password has been updated."}


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user_id: CurrentUserId,
    db=Depends(get_database),
):
    """Delete user account."""
    await FeedbackRepository(db).delete_by_user(current_user_id)
    await db.password_change_otps.delete_one({"user_id": ObjectId(current_user_id)})
    user_repo = UserRepository(db)
    await user_repo.delete(current_user_id)
