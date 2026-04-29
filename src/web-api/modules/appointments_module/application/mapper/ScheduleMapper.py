from datetime import datetime, timezone
from bson import ObjectId
from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.domains.schedule.Schedule import Schedule


class ScheduleMapper:
    @staticmethod
    def to_domain(dto: CreateScheduleDTO) -> Schedule:
        # Примітка: цей метод тепер рідше використовується,
        # бо ми збираємо Schedule вручну в сервісі для нарізки слотів
        return Schedule(
            doctor_id=ObjectId(dto.doctorId),
            month=getattr(dto, 'month', 1),
            year=getattr(dto, 'year', 2026),
            title=dto.title,
            is_repeated=dto.isRepeated,
            repeating=dto.repeating.dict(),
            slots=[],
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )

    @staticmethod
    def to_dto(schedule: Schedule) -> dict:
        if not schedule:
            return {}
        data = schedule.to_dict()

        if "_id" in data:
            data["id"] = str(data.pop("_id"))

        data["doctorId"] = str(data["doctorId"])
        if "slots" in data:
            for slot in data["slots"]:
                if "slotId" in slot:
                    slot["slotId"] = str(slot["slotId"])

        return data
