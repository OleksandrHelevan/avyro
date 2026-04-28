from typing import List, Optional
from bson import ObjectId

from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.application.dto.UpdateScheduleDTO import UpdateScheduleDTO
from modules.appointments_module.application.mapper.ScheduleMapper import ScheduleMapper
from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository
from modules.appointments_module.application.service.SlotService import SlotService


class ScheduleService:
    def __init__(self, repository: ScheduleRepository, slot_service: SlotService):
        self.repository = repository
        self.slot_service = slot_service

    def create_schedule(self, dto: CreateScheduleDTO) -> dict:
        schedule_domain = ScheduleMapper.to_domain(dto)
        created_schedule = self.repository.create(schedule_domain)
        self.slot_service.generate_slots_for_schedule(created_schedule, days_ahead=30)

        return ScheduleMapper.to_dto(created_schedule)

    def delete_schedule(self, schedule_id: str) -> bool:
        s_id = ObjectId(schedule_id)
        self.slot_service.slot_repository.delete_by_schedule(s_id)
        return self.repository.delete(s_id)

    def get_doctor_schedules(self, doctor_id: str) -> List[dict]:
        schedules = self.repository.get_by_doctor_id(ObjectId(doctor_id))
        return [ScheduleMapper.to_dto(s) for s in schedules]

    def get_schedule_by_id(self, schedule_id: str) -> Optional[dict]:
        schedule = self.repository.get_by_id(ObjectId(schedule_id))
        if not schedule:
            return None
        return ScheduleMapper.to_dto(schedule)

    def update_schedule(self, schedule_id: str, dto: UpdateScheduleDTO) -> Optional[dict]:
        existing = self.repository.get_by_id(ObjectId(schedule_id))
        if not existing:
            return None

        update_data = dto.dict(exclude_unset=True)

        self.repository.update(ObjectId(schedule_id), update_data)
        updated_schedule = self.repository.get_by_id(ObjectId(schedule_id))
        return ScheduleMapper.to_dto(updated_schedule)
