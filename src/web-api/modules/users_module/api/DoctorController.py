from fastapi import APIRouter, Depends, HTTPException, status, Query
from config.dependencies import get_doctor_service, get_patient_service
from config.security import get_current_user
from typing import List
from config.logging_config import logger
from modules.users_module.application.dto.DoctorListItemResponse import DoctorListItemResponse
from modules.users_module.application.services.DoctorService import DoctorService
from modules.users_module.application.dto.DoctorProfile import (
    DoctorProfileUpdateRequest,
    DoctorProfileResponse,
)

router = APIRouter(prefix="/users/doctors", tags=["Doctors"])


def require_doctor_role(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "DOCTOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ заборонено. Ця дія доступна лише для лікарів."
        )
    return user


@router.get("/{user_id}", response_model=DoctorProfileResponse)
def get_doctor_by_id(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    service: DoctorService = Depends(get_doctor_service)
):
    return service.get_doctor_by_id(user_id)


@router.get("", response_model=List[DoctorListItemResponse])
def get_doctors(
    service=Depends(get_patient_service)
):
    logger.info("Fetching doctors list.")
    return service.get_doctors_list()


@router.patch("", response_model=DoctorProfileResponse)
def patch_doctor_profile(
    profile_data: DoctorProfileUpdateRequest,
    current_user: dict = Depends(require_doctor_role),
    service: DoctorService = Depends(get_doctor_service)
):
    user_id = current_user.get("sub")
    return service.patch_doctor_profile(user_id, profile_data)
