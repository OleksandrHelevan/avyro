from fastapi import APIRouter, Depends, HTTPException
from modules.users_module.application.dto.UserResponse import UserResponse
from modules.users_module.application.services.UserService import UserService
from config.db import db
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository

router = APIRouter(prefix="/users", tags=["Users"])

def get_user_service() -> UserService:
    return UserService(UserRepository(db.users))

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    service: UserService = Depends(get_user_service)
):
    user = service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/email/{email}", response_model=UserResponse)
async def get_user_by_email(
    email: str,
    service: UserService = Depends(get_user_service)
):
    user = service.get_user_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="User with this email not found")
    return user
