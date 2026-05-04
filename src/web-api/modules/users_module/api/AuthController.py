from fastapi import APIRouter, Depends, status
from typing import Any

from config.dependencies import get_auth_service, get_patient_service
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.application.dto.LoginResponse import LoginResponse
from modules.users_module.application.dto.CreateUserRequest import CreateUserRequest
# Додаємо імпорт нового DTO
from modules.users_module.application.dto.DoctorStatusResponse import DoctorStatusResponse
from modules.users_module.application.services.AuthService import AuthService
from modules.users_module.application.services.PatientService import PatientService
from config.logging_config import logger

router = APIRouter(prefix="", tags=["Auth"])

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
    user_service: PatientService = Depends(get_patient_service)
):
    logger.info(f"Registration attempt for email: {request.email} with role: {request.role}")
    result = user_service.create_user(request)

    if isinstance(result, dict):
        logger.info(f"Doctor registration request created: {request.email}")
        return result

    logger.info(f"User registered successfully: {request.email} (ID: {result.id})")
    return result

# === НОВИЙ ЕНДПОІНТ ===
@router.get("/doctors", response_model=DoctorStatusResponse)
async def check_doctor_status(
    email: str,
    auth_service: AuthService = Depends(get_auth_service)
):
    logger.info(f"Checking registration status for doctor email: {email}")
    # Делегуємо бізнес-логіку в AuthService
    result = auth_service.check_doctor_status(email)
    return result
