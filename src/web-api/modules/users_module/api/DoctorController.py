from fastapi import APIRouter, Depends, HTTPException, status, Query
from config.dependencies import get_doctor_service, get_patient_service
from config.security import get_current_user

from typing import Optional, List, Any
from config.logging_config import logger

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
    service: DoctorService = Depends(get_doctor_service)
):
    return service.get_doctor_by_id(user_id)

@router.patch("/{user_id}", response_model=DoctorProfileResponse)
def patch_doctor_profile(
    user_id: str,
    profile_data: DoctorProfileUpdateRequest,
    current_user: dict = Depends(require_doctor_role),
    service: DoctorService = Depends(get_doctor_service)
):
    token_user_id = current_user.get("sub")

    if not token_user_id or str(token_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ви можете редагувати лише власний профіль"
        )

    return service.patch_doctor_profile(user_id, profile_data)

@router.get("", response_model=List[Any])
def get_doctors(
    specialization: Optional[str] = Query(None, description="Filter doctors by specialization ID"),
    service=Depends(get_patient_service)
):
    logger.info(f"Fetching doctors list. Specialization filter: {specialization}")
    return service.get_doctors_list(specialization)
