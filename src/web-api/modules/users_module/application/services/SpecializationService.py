import logging
from bson.errors import InvalidId
from bson.objectid import ObjectId
from fastapi import HTTPException, status

from modules.users_module.infrastructure.persistence.SpecializationRepository import SpecializationRepository
from modules.users_module.application.dto.SpecializationDto import CreateSpecializationRequest
from modules.users_module.domains.specialization.Specialization import Specialization

logger = logging.getLogger(__name__)


class SpecializationService:
    def __init__(self, repository: SpecializationRepository):
        self.repository = repository

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
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID спеціалізації")

        spec = self.repository.get_by_id(oid)
        if not spec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Спеціалізацію не знайдено")

        return {
            "_id": str(spec.id),
            "name": spec.name,
            "description": spec.description
        }

    def create_specialization(self, request: CreateSpecializationRequest) -> dict:
        # Створюємо доменну модель
        new_spec = Specialization(name=request.name, description=request.description)

        # Зберігаємо в базу
        created_spec = self.repository.create(new_spec)

        return {
            "_id": str(created_spec.id),
            "name": created_spec.name,
            "description": created_spec.description
        }
