from fastapi import APIRouter, Depends
from config.db import db
from config.logging_config import logger
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.users_module.application.services.UserService import UserService

from modules.users_module.application.dto.AddProfilePatientRequest import AddPatientProfileRequest
from modules.users_module.application.dto.PatientResponse import PatientResponse

from config.security import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


def get_user_service():
    return UserService(UserRepository(db["Users"]))


@router.get("/patients/{user_id}", response_model=PatientResponse)
def get_patient_profile(
    user_id: str,
    _=Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    logger.info(f"Fetching patient profile for ID: {user_id}")
    return service.get_patient_profile(user_id)

@router.patch("/patients/{user_id}", response_model=PatientResponse)
def patch_patient_profile(
    user_id: str,
    request: AddPatientProfileRequest,
    _=Depends(get_current_user),
    service: UserService = Depends(get_user_service),
):
    logger.info(f"Updating patient profile for ID: {user_id}")
    result = service.patch_patient_profile(user_id, request)
    logger.info(f"Profile updated successfully for ID: {user_id}")
    return result
