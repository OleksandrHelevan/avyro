from bson import ObjectId
from fastapi import HTTPException

from modules.requests_module.domains.Request import (RequestType, RequestStatus)
from modules.appointments_module.application.dto.CreateScheduleDTO import (CreateScheduleDTO)
from modules.users_module.application.dto.CreateUserRequest import (CreateUserRequest)
from modules.users_module.application.dto.SpecializationDto import (CreateSpecializationRequest)


class AdminRequestService:
    def __init__(self, request_repo, user_service, schedule_service, specialization_service):
        self.request_repo = request_repo
        self.user_service = user_service
        self.schedule_service = schedule_service
        self.specialization_service = specialization_service

    def approve_registration(self, request_id: str, admin_id: str):
        req = self.request_repo.get_by_id(ObjectId(request_id))
        if not req or req.type != RequestType.DOCTOR_REGISTRATION:
            raise HTTPException(404, "Запит на реєстрацію не знайдено")

        if req.status != RequestStatus.PENDING:
            raise HTTPException(400, f"Запит уже має статус {req.status.value}")

        try:
            user_data = CreateUserRequest(**req.payload)

            existing_user = self.user_service.get_user_by_email(user_data.email)
            if existing_user:
                self.request_repo.update_status(
                    ObjectId(request_id),
                    RequestStatus.REJECTED,
                    ObjectId(admin_id),
                    "Користувач з такою електронною адресою вже зареєстрований"
                )
                raise HTTPException(400, "Користувач вже існує в системі")

            new_user = self.user_service.create_user_final(user_data)

            self.request_repo.update_status(
                ObjectId(request_id),
                RequestStatus.APPROVED,
                ObjectId(admin_id)
            )
            return new_user

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(400, detail=f"Помилка при створенні лікаря: {str(e)}")

    def approve_schedule(
        self,
        request_id: str,
        admin_id: str
    ):

        req = self.request_repo.get_by_id(ObjectId(request_id))

        if not req or req.type != RequestType.SCHEDULE_CREATION:
            raise HTTPException(404, "Запит на розклад не знайдено")

        if req.status != RequestStatus.PENDING:
            raise HTTPException(400, "Запит уже був оброблений")

        try:
            dto = CreateScheduleDTO(**req.payload)

            result = self.schedule_service.create_monthly_schedule(
                dto.doctorId,
                dto.year,
                dto.month,
                dto
            )

            self.request_repo.update_status(ObjectId(request_id), RequestStatus.APPROVED, ObjectId(admin_id))

            return result

        except Exception as e:
            raise HTTPException(400, detail=f"Помилка при генерації розкладу: {str(e)}")

    def approve_specialization(self, request_id: str, admin_id: str):

        req = self.request_repo.get_by_id(ObjectId(request_id))

        if not req or req.type != RequestType.SPECIALIZATION_CREATION:
            raise HTTPException(404, "Запит на спеціалізацію не знайдено")

        if req.status != RequestStatus.PENDING:
            raise HTTPException(400, "Запит уже був оброблений")

        try:
            dto = CreateSpecializationRequest(**req.payload)
            result = (self.specialization_service.create_specialization(dto))
            self.request_repo.update_status(ObjectId(request_id), RequestStatus.APPROVED, ObjectId(admin_id))

            return result

        except Exception as e:
            raise HTTPException(400, detail=f"Помилка створення спеціалізації: {str(e)}")

    def get_all_registration_requests(self, status: RequestStatus = None):
        return self.request_repo.get_requests_by_type(RequestType.DOCTOR_REGISTRATION, status)

    def get_all_schedule_requests(self, status: RequestStatus = None):
        return self.request_repo.get_requests_by_type(RequestType.SCHEDULE_CREATION, status)

    def get_all_specialization_requests(self, status: RequestStatus = None):
        return self.request_repo.get_requests_by_type(RequestType.SPECIALIZATION_CREATION, status)

    def update_request_status(self, request_id: str, new_status: str, admin_id: str, comment: str = None):
        req = self.request_repo.get_by_id(ObjectId(request_id))
        if not req:
            raise HTTPException(404, "Запит не знайдено")

        try:
            status_enum = RequestStatus(new_status)
        except ValueError:
            raise HTTPException(400, f"Невірний статус: {new_status}. Доступні: {[s.value for s in RequestStatus]}")

        success = self.request_repo.update_status(
            ObjectId(request_id),
            status_enum,
            ObjectId(admin_id),
            comment
        )
        if not success:
            raise HTTPException(400, "Не вдалося оновити статус")

        updated = self.request_repo.get_by_id(ObjectId(request_id))
        return updated.to_dict()
