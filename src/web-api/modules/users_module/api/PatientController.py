from fastapi import APIRouter, Depends
from config.db import db
from config.logging_config import logger

from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
# ДОДАНО: імпорти RequestRepository та RewardRepository
from modules.admin_module.infrastructure.persistence.RequestRepository import RequestRepository
from modules.users_module.infrastructure.persistence.RewardRepository import RewardRepository

from modules.users_module.application.services.PatientService import PatientService
from modules.users_module.application.dto.AddProfilePatientRequest import AddPatientProfileRequest
from modules.users_module.application.dto.PatientResponse import PatientResponse
from config.security import get_current_user

router = APIRouter(prefix="/users", tags=["Patients"])

def get_user_service():
    # ОНОВЛЕНО: передаємо всі 3 репозиторії (як і в AuthController)
    return PatientService(
        user_repository=UserRepository(db["Users"]),
        request_repository=RequestRepository(db["Requests"]),
        reward_repository=RewardRepository(db["Rewards"])
    )

@router.get("/patients/{user_id}", response_model=PatientResponse)
def get_patient_profile(
    user_id: str,
    _=Depends(get_current_user),
    service: PatientService = Depends(get_user_service),
):
    logger.info(f"Fetching patient profile for ID: {user_id}")
    return service.get_patient_profile(user_id)

@router.patch("/patients/{user_id}", response_model=PatientResponse)
def patch_patient_profile(
    user_id: str,
    request: AddPatientProfileRequest,
    _=Depends(get_current_user),
    service: PatientService = Depends(get_user_service),
):
    return service.patch_patient_profile(user_id, request)
