from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from modules.requests_module.domains.Request import Request, RequestType
from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.application.mapper.ScheduleMapper import ScheduleMapper
from modules.appointments_module.application.service.SlotService import SlotService
from modules.appointments_module.domains.schedule.Schedule import Schedule
from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository


class ScheduleService:
    def __init__(self, repository: ScheduleRepository, slot_service: SlotService, request_repository):
        self.repository = repository
        self.slot_service = slot_service
        self.request_repository = request_repository

    def create_schedule(self, dto: CreateScheduleDTO) -> dict:
        month = getattr(dto, 'month', datetime.now(timezone.utc).month)
        year = getattr(dto, 'year', datetime.now(timezone.utc).year)
        return self.create_monthly_schedule(dto.doctorId, year, month, dto)

    def get_doctor_slots(self, doctor_id: str) -> list:
        try:
            doc_oid = ObjectId(doctor_id)
        except (InvalidId, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID лікаря"
            )

        schedules = self.repository.get_all_by_doctor_id(doc_oid)

        if not schedules:
            return []

        all_slots = []
        for schedule in schedules:
            for slot in schedule.slots:
                all_slots.append({
                    "slotId": str(slot.id) if slot.id else None,
                    "from": slot.from_time.isoformat() if slot.from_time else None,
                    "to": slot.to_time.isoformat() if slot.to_time else None,
                    "type": slot.slot_type.value if slot.slot_type else None,
                    "appointmentId": str(slot.appointment_id) if slot.appointment_id else None,
                })

        return all_slots

    def request_schedule_creation(self, dto: CreateScheduleDTO) -> str:
        request_obj = Request(
            creator_id=ObjectId(dto.doctorId),
            type=RequestType.SCHEDULE_CREATION,
            payload=dto.dict()
        )
        saved_request = self.request_repository.create(request_obj)
        return str(saved_request.id)

    def create_monthly_schedule(self, doctor_id: str, year: int, month: int, dto: CreateScheduleDTO) -> dict:
        slots = self.slot_service.generate_monthly_slots(
            doctor_id=doctor_id,
            year=year,
            month=month,
            config=dto.repeating.dict()
        )

        schedule_domain = Schedule(
            doctor_id=ObjectId(doctor_id),
            month=month,
            year=year,
            title=dto.title,
            is_repeated=dto.isRepeated,
            repeating=dto.repeating.dict(),
            slots=slots,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

        created_schedule = self.repository.create(schedule_domain)
        return ScheduleMapper.to_dto(created_schedule)
