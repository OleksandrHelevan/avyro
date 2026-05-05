import logging


from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from modules.requests_module.domains.Request import (
    Request,
    RequestType,
    RequestStatus
)

from modules.users_module.infrastructure.persistence.SpecializationRepository import (
    SpecializationRepository
)

from modules.users_module.application.dto.SpecializationDto import (
    CreateSpecializationRequest
)

logger = logging.getLogger(__name__)


class SpecializationService:
    def __init__(self, repository, request_repository):
        self.repository = repository
        self.request_repository = request_repository

    # === 1. НОВИЙ МЕТОД ДЛЯ АДМІНА ===
    def create_specialization_direct(self, request: CreateSpecializationRequest) -> dict:
        # Перевірка на унікальність імені в головній БД
        existing_spec = self.repository.get_by_name(request.name)
        if existing_spec:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Спеціалізація з ім'ям '{request.name}' вже існує"
            )

        created_spec = self.repository.create(request)

        return {
            "_id": str(created_spec.id),
            "name": created_spec.name,
            "description": created_spec.description
        }

    def get_all_specializations(self) -> list[dict]:
        specs = self.repository.get_all()

        return [
            {
                "_id": str(spec.id),
                "name": spec.name,
                "description": spec.description
            }
            for spec in specs
        ]

    def get_specialization_by_id(self, spec_id: str) -> dict:
        try:
            oid = ObjectId(spec_id)

        except InvalidId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID спеціалізації"
            )

        spec = self.repository.get_by_id(oid)

        if not spec:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Спеціалізацію не знайдено"
            )

        return {
            "_id": str(spec.id),
            "name": spec.name,
            "description": spec.description
        }

    def create_specialization_request(
        self,
        request: CreateSpecializationRequest,
        doctor_id: str
    ) -> dict:
        # НОВА ВАЛІДАЦІЯ: Перевіряємо, чи така спеціалізація ВЖЕ існує в головній базі
        existing_spec = self.repository.get_by_name(request.name)
        if existing_spec:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Спеціалізація '{request.name}' вже існує в системі. Виберіть її зі списку."
            )

        # СТАРА ВАЛІДАЦІЯ: Перевіряємо, чи немає вже відкритої заявки
        existing_request = (
            self.request_repository
            .get_active_specialization_by_name(request.name)
        )

        if existing_request:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Запит на створення такої спеціалізації вже розглядається адміністратором"
            )

        new_request = Request(
            creator_id=ObjectId(doctor_id),
            type=RequestType.SPECIALIZATION_CREATION,
            status=RequestStatus.PENDING,
            payload={
                "name": request.name,
                "description": request.description
            }
        )

        created_request = self.request_repository.create(new_request)

        return {
            "message": "Запит на створення спеціалізації відправлено",
            "requestId": str(created_request.id)
        }
