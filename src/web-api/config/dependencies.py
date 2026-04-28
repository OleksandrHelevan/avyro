from config.db import db
from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository
from modules.appointments_module.infrastructure.persistence.SlotRepository import SlotRepository
from modules.appointments_module.application.service.ScheduleService import ScheduleService
from modules.appointments_module.application.service.SlotService import SlotService


schedule_repo = ScheduleRepository(db["Schedules"])
slot_repo = SlotRepository(db["Slots"])

def get_slot_service() -> SlotService:
    return SlotService(slot_repo)

def get_schedule_service() -> ScheduleService:
    slot_service = get_slot_service()
    return ScheduleService(schedule_repo, slot_service)
