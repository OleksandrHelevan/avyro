from datetime import datetime, timezone
from bson import ObjectId

from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.domains.schedule.Schedule import Schedule

class ScheduleMapper:
    @staticmethod
    def to_domain(dto: CreateScheduleDTO) -> Schedule:
        return Schedule(
            doctor_id=ObjectId(dto.doctorId),
            title=dto.title,
            is_repeated=dto.isRepeated,
            repeating=dto.repeating.dict(),
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

    @staticmethod
    def to_dto(schedule: Schedule) -> dict:
        # Повертаємо словник, який легко серіалізувати в JSON
        data = schedule.to_dict()
        if "_id" in data:
            data["id"] = str(data.pop("_id"))
        data["doctorId"] = str(data["doctorId"])
        return data
