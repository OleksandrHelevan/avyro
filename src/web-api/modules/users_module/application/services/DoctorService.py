# Файл: modules/users_module/application/services/DoctorService.py

import logging
from bson.errors import InvalidId
from bson.objectid import ObjectId
from fastapi import HTTPException, status

from modules.users_module.application.dto.DoctorProfile import DoctorProfileUpdateRequest, DoctorProfileResponse
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository

logger = logging.getLogger(__name__)


class DoctorService:
    # 1. Додаємо ініціалізацію, щоб приймати репозиторій
    def __init__(self, repository: UserRepository):
        self.repository = repository

    # 2. Робимо твою функцію методом класу (додаємо self)
    async def update_doctor_profile(
        self,
        user_id: str,
        profile_data: DoctorProfileUpdateRequest
    ) -> DoctorProfileResponse:

        # Оскільки ми використовуємо Repository (як у UserService),
        # доступ до бази має йти через self.repository, а не через прямий клієнт.
        # Наприклад: await self.repository.update_user(...)

        try:
            spec_oid = ObjectId(profile_data.specialization_id)
            # ... далі твоя логіка оновлення

            pass  # заміни pass на свій код

        except InvalidId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний ID спеціалізації"
            )

# Файл: modules/users_module/application/services/DoctorService.py

    # ... твій попередній код (__init__ та update_doctor_profile) ...

    def get_doctor_by_id(self, user_id: str):
        # 1. Перевіряємо валідність ObjectID
        try:
            user_oid = ObjectId(user_id)
        except InvalidId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID лікаря"
            )

        # 2. Отримуємо користувача з бази через існуючий метод репозиторію
        user = self.repository.get_by_id(user_oid)

        # 3. Якщо користувача немає
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Лікаря не знайдено"
            )

        # 4. Перевіряємо, чи цей користувач має роль DOCTOR (можливо, атрибут називається user.role)
        if user.role != "DOCTOR":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Користувач за цим ID не є лікарем"
            )

        # 5. Повертаємо дані (адаптуй цей словник під те, що очікує твій DoctorProfileResponse)
        # Приклад того, як це може виглядати:
        return {
            "id": str(user.id),
            "email": user.email,
            # Якщо профіль лежить у властивості profile:
            **getattr(user, "profile", {})
        }
