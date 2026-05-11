from fastapi import APIRouter, Depends
from config.dependencies import get_patient_service
from config.logging_config import logger


from modules.users_module.application.services.PatientService import PatientService
from modules.users_module.application.dto.AddProfilePatientRequest import AddPatientProfileRequest
from modules.users_module.application.dto.PatientResponse import PatientResponse
from config.security import get_current_user

router = APIRouter(prefix="/users", tags=["Patients"])

@router.get("/patients/{user_id}", response_model=PatientResponse)
def get_patient_profile(
    user_id: str,
    _=Depends(get_current_user),
    service: PatientService = Depends(get_patient_service),
):
    logger.info(f"Fetching patient profile for ID: {user_id}")
    return service.get_patient_profile(user_id)

@router.patch("/patients/{user_id}", response_model=PatientResponse)
def patch_patient_profile(
    user_id: str,
    request: AddPatientProfileRequest,
    _=Depends(get_current_user),
    service: PatientService = Depends(get_patient_service),
):
    return service.patch_patient_profile(user_id, request)
