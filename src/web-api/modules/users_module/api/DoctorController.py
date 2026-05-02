from fastapi import APIRouter, Depends, HTTPException, status, Query
from config.db import db
from config.security import get_current_user

from typing import Optional, List, Any
from config.logging_config import logger

from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.users_module.infrastructure.persistence.SpecializationRepository import SpecializationRepository
from modules.users_module.application.services.DoctorService import DoctorService

from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.admin_module.infrastructure.persistence.RequestRepository import RequestRepository
from modules.users_module.infrastructure.persistence.RewardRepository import RewardRepository
from modules.users_module.application.services.PatientService import PatientService

from modules.users_module.application.dto.DoctorProfile import (
    DoctorProfileUpdateRequest,
    DoctorProfileUpdateResponse,
    DoctorProfileResponse
)

# Якщо у тебе роутер вже з префіксом /users, зміни префікс за потреби.
# Я залишаю /api/v1/doctors як у твоїх попередніх файлах, але шляхи всередині відповідають твоїй тасці
router = APIRouter(prefix="/users/doctors", tags=["Doctors"])


def get_doctor_service() -> DoctorService:
    # Ініціалізуємо обидва репозиторії
    user_repo = UserRepository(db["Users"])
    spec_repo = SpecializationRepository(db["Specializations"])
    return DoctorService(user_repository=user_repo, spec_repository=spec_repo)


def require_doctor_role(user: dict = Depends(get_current_user)) -> dict:
    # RBAC: Тільки для лікарів
    if user.get("role") != "DOCTOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ заборонено. Ця дія доступна лише для лікарів."
        )
    return user


@router.patch("/{user_id}", response_model=DoctorProfileUpdateResponse)
def patch_doctor_profile(
    user_id: str,
    profile_data: DoctorProfileUpdateRequest,
    current_user: dict = Depends(require_doctor_role),
    service: DoctorService = Depends(get_doctor_service)
):
    """Оновити профіль лікаря (тільки для лікарів)"""

    # 1. Чітко беремо ID з ключа 'sub', оскільки ми дізналися, що він саме там
    token_user_id = current_user.get("sub")

    # 2. Перевіряємо, чи є ID в токені взагалі, і чи збігається він з ID з URL
    if not token_user_id or str(token_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Ви можете редагувати лише власний профіль"
        )

    # 3. Якщо все добре — оновлюємо
    return service.patch_doctor_profile(user_id, profile_data)

def get_user_service():
    return PatientService(
        user_repository=UserRepository(db["Users"]),
        request_repository=RequestRepository(db["Requests"]),
        reward_repository=RewardRepository(db["Rewards"])
    )


@router.get("", response_model=List[Any]) # Або використовуйте конкретний DTO (наприклад, List[DoctorResponse])
def get_doctors(
    specialization: Optional[str] = Query(None, description="Filter doctors by specialization ID"),
    # _=Depends(get_current_user), # Розкоментуйте, якщо список лікарів доступний тільки авторизованим
    service = Depends(get_user_service) # Замініть на свій метод отримання сервісу
):
    logger.info(f"Fetching doctors list. Specialization filter: {specialization}")
    return service.get_doctors_list(specialization)

