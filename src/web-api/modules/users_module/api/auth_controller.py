from fastapi import APIRouter, Depends, status
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.application.dto.LoginResponse import LoginResponse
from modules.users_module.application.dto.CreateUserRequest import CreateUserRequest
from modules.users_module.application.dto.UserResponse import UserResponse
from modules.users_module.application.services.AuthService import AuthService
from modules.users_module.application.services.UserService import UserService
from config.db import db
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from config.logging_config import logger
router = APIRouter(prefix="", tags=["Auth"])

def get_auth_service() -> AuthService:
    return AuthService(UserRepository(db["Users"]))

def get_user_service() -> UserService:
    return UserService(UserRepository(db["Users"]))

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    logger.info(f"Login attempt for user: {request.email}")
    result = auth_service.login(request)
    logger.info(f"Login successful for user: {request.email}")
    return result

@router.post("/sign-up", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: CreateUserRequest,
    user_service: UserService = Depends(get_user_service)
):
    logger.info(f"Registration attempt for email: {request.email} with role: {request.role}")
    result = user_service.create_user(request)
    logger.info(f"User registered successfully: {request.email} (ID: {result.id})")
    return result
