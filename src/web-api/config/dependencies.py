from config.db import db
from modules.admin_module.infrastructure.persistence.RequestRepository import RequestRepository
from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository
from modules.appointments_module.application.service.ScheduleService import ScheduleService
from modules.appointments_module.application.service.SlotService import SlotService


def get_schedule_service():
    schedule_repo = ScheduleRepository(db["Schedules"])
    slot_service = SlotService()
    request_repo = RequestRepository(db["Requests"])
    return ScheduleService(schedule_repo, slot_service, request_repo)
