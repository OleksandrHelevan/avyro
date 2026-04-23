from fastapi import APIRouter, Depends, HTTPException, status
from config.db import db
from config.security import get_current_user

# Імпортуємо Repository та Service (за аналогією з Users)
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.users_module.application.services.DoctorService import DoctorService

# DTO
from modules.users_module.application.dto.DoctorProfile import DoctorProfileUpdateRequest, DoctorProfileResponse

router = APIRouter(prefix="/api/v1/doctors", tags=["Doctors"])


# 1. Dependency Injection для Service
def get_doctor_service() -> DoctorService:
    # Припускаємо, що лікарі зберігаються в тій самій колекції Users,
    # оскільки ми перевіряємо поле "role" у юзера.
    return DoctorService(UserRepository(db["Users"]))


# 2. Перевірка ролі лікаря
def require_doctor_role(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "DOCTOR":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Доступ заборонено. Ця дія доступна лише для лікарів."
        )
    return user


# 3. Сам ендпоінт
@router.put("/me/profile", response_model=DoctorProfileResponse)
async def api_update_doctor_profile(
    profile_data: DoctorProfileUpdateRequest,
    current_user: dict = Depends(require_doctor_role),
    service: DoctorService = Depends(get_doctor_service)
):
    # Отримуємо ID користувача (залежить від того, як він зберігається в токені/базі)
    user_id = str(current_user.get("_id") or current_user.get("id"))

    # Викликаємо метод сервісу замість прямої роботи з БД
    return service.update_doctor_profile(user_id, profile_data)

# Файл: modules/users_module/api/DoctorController.py

# ... твої попередні імпорти та роути ...

@router.get("/{user_id}", response_model=DoctorProfileResponse)
def api_get_doctor_by_id(
    user_id: str,
    # Будь-який авторизований користувач може переглядати профіль лікаря
    _ = Depends(get_current_user),
    service: DoctorService = Depends(get_doctor_service)
):
    return service.get_doctor_by_id(user_id)
