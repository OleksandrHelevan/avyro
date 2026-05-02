from fastapi import APIRouter, Depends, status

from modules.admin_module.infrastructure.persistence.RequestRepository import RequestRepository
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.application.dto.LoginResponse import LoginResponse
from modules.users_module.application.dto.CreateUserRequest import CreateUserRequest
from typing import Any
from modules.users_module.application.services.AuthService import AuthService
from modules.users_module.application.services.PatientService import PatientService
from config.db import db
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
# ДОДАНО: імпорт RewardRepository
from modules.users_module.infrastructure.persistence.RewardRepository import RewardRepository
from config.logging_config import logger

router = APIRouter(prefix="", tags=["Auth"])

def get_auth_service() -> AuthService:
    return AuthService(UserRepository(db["Users"]))

def get_user_service() -> PatientService:
    # ОНОВЛЕНО: передаємо всі 3 репозиторії
    return PatientService(
        user_repository=UserRepository(db["Users"]),
        request_repository=RequestRepository(db["Requests"]),
        reward_repository=RewardRepository(db["Rewards"])
    )

@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    logger.info(f"Login attempt for user: {request.email}")
    result = auth_service.login(request)
    logger.info(f"Login successful for user: {request.email}")
    return result

@router.post("/sign-up", response_model=Any, status_code=status.HTTP_201_CREATED)
async def register(
    request: CreateUserRequest,
    user_service: PatientService = Depends(get_user_service)
):
    logger.info(f"Registration attempt for email: {request.email} with role: {request.role}")
    result = user_service.create_user(request)

    if isinstance(result, dict):
        logger.info(f"Doctor registration request created: {request.email}")
        return result

    logger.info(f"User registered successfully: {request.email} (ID: {result.id})")
    return result
