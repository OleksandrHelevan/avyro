from fastapi import APIRouter, Depends, status
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.application.dto.LoginResponse import LoginResponse
from modules.users_module.application.dto.CreateUserRequest import CreateUserRequest
from modules.users_module.application.dto.UserResponse import UserResponse
from modules.users_module.application.services.AuthService import AuthService
from modules.users_module.application.services.UserService import UserService
from config.db import db
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_auth_service() -> AuthService:
    return AuthService(UserRepository(db["Users"]))

def get_user_service() -> UserService:
    return UserService(UserRepository(db["Users"]))

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    return auth_service.login(request)

@router.post("/sign-up", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: CreateUserRequest,
    user_service: UserService = Depends(get_user_service)
):
    return user_service.create_user(request)
