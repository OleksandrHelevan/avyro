from datetime import datetime, timezone
from bson import ObjectId

from modules.admin_module.domains.Request import Request, RequestType
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
