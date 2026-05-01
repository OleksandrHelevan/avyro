from bson import ObjectId
from fastapi import HTTPException

from modules.admin_module.domains.Request import RequestType, RequestStatus
from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.users_module.application.dto.CreateUserRequest import CreateUserRequest


class AdminRequestService:
    def __init__(self, request_repo, user_service, schedule_service):
        self.request_repo = request_repo
        self.user_service = user_service
        self.schedule_service = schedule_service

    def approve_registration(self, request_id: str, admin_id: str):
        req = self.request_repo.get_by_id(ObjectId(request_id))

        if not req or req.type != RequestType.DOCTOR_REGISTRATION:
            raise HTTPException(404, "Запит на реєстрацію не знайдено")

        if req.status != RequestStatus.PENDING:
            raise HTTPException(400, f"Запит уже має статус {req.status.value}")

        try:
            user_data = CreateUserRequest(**req.payload)
            new_user = self.user_service.create_user_final(user_data)

            self.request_repo.update_status(
                ObjectId(request_id),
                RequestStatus.APPROVED,
                ObjectId(admin_id)
            )
            return new_user
        except Exception as e:
            raise HTTPException(400, detail=f"Помилка при створенні лікаря: {str(e)}")

    def approve_schedule(self, request_id: str, admin_id: str):
        req = self.request_repo.get_by_id(ObjectId(request_id))

        if not req or req.type != RequestType.SCHEDULE_CREATION:
            raise HTTPException(404, "Запит на розклад не знайдено")

        if req.status != RequestStatus.PENDING:
            raise HTTPException(400, "Запит уже був оброблений (схвалений або відхилений)")

        try:
            dto = CreateScheduleDTO(**req.payload)
            result = self.schedule_service.create_monthly_schedule(
                dto.doctorId, dto.year, dto.month, dto
            )

            self.request_repo.update_status(
                ObjectId(request_id),
                RequestStatus.APPROVED,
                ObjectId(admin_id)
            )
            return result
        except Exception as e:
            raise HTTPException(400, detail=f"Помилка при генерації розкладу: {str(e)}")

    def get_all_registration_requests(self):
        return self.request_repo.get_requests_by_type(RequestType.DOCTOR_REGISTRATION)

    def get_all_schedule_requests(self):
        return self.request_repo.get_requests_by_type(RequestType.SCHEDULE_CREATION)
