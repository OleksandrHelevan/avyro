from fastapi import APIRouter, Depends, status
from typing import List

from config.db import db
from config.security import get_current_user

from modules.users_module.infrastructure.persistence.SpecializationRepository import SpecializationRepository
from modules.users_module.application.services.SpecializationService import SpecializationService
from modules.users_module.application.dto.SpecializationDto import (
    SpecializationResponse,
    CreateSpecializationRequest
)

router = APIRouter(prefix="/specializations", tags=["Specializations"])


def get_specialization_service() -> SpecializationService:
    repo = SpecializationRepository(db["Specializations"])
    return SpecializationService(repo)


@router.get("/", response_model=List[SpecializationResponse])
def get_all_specializations(
    service: SpecializationService = Depends(get_specialization_service)
):
    """Отримати список усіх медичних спеціалізацій (для випадаючого списку на фронтенді)"""
    return service.get_all_specializations()


@router.get("/{spec_id}", response_model=SpecializationResponse)
def get_specialization_by_id(
    spec_id: str,
    service: SpecializationService = Depends(get_specialization_service)
):
    """Отримати дані конкретної спеціалізації за ID"""
    return service.get_specialization_by_id(spec_id)

