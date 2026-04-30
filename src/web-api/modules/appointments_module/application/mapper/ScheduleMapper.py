from datetime import datetime, timezone
from bson import ObjectId
from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.domains.schedule.Schedule import Schedule


class ScheduleMapper:
    @staticmethod
    def to_domain(dto: CreateScheduleDTO) -> Schedule:
        return Schedule(
            doctor_id=ObjectId(dto.doctorId),
            month=dto.month,
            year=dto.year,
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
        if "status" in data:
            data["status"] = data["status"].value if hasattr(data["status"], "value") else str(data["status"])

        if "slots" in data:
            for slot in data["slots"]:
                if "slotId" in slot and slot["slotId"]:
                    slot["slotId"] = str(slot["slotId"])
                if "appointmentId" in slot and slot["appointmentId"]:
                    slot["appointmentId"] = str(slot["appointmentId"])

        return data
