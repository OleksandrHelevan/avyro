from fastapi import APIRouter, Depends, status
from typing import List

from config.dependencies import get_specialization_service
from config.permissions import allow_doctor

from modules.users_module.application.services.SpecializationService import (
    SpecializationService
)

from modules.users_module.application.dto.SpecializationDto import (
    SpecializationResponse,
    CreateSpecializationRequest
)

router = APIRouter(
    prefix="/specializations",
    tags=["Specializations"]
)


@router.get("", response_model=List[SpecializationResponse])
def get_all_specializations(
    service: SpecializationService = Depends(get_specialization_service)
):
    return service.get_all_specializations()


@router.get("/{spec_id}", response_model=SpecializationResponse)
def get_specialization_by_id(
    spec_id: str,
    service: SpecializationService = Depends(get_specialization_service)
):
    return service.get_specialization_by_id(spec_id)


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_specialization(
    request: CreateSpecializationRequest,
    current_doctor: dict = Depends(allow_doctor),
    service: SpecializationService = Depends(get_specialization_service)
):
    return service.create_specialization_request(
        request,
        str(current_doctor["sub"])
    )
