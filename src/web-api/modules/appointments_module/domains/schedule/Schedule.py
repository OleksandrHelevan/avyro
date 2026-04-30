from enum import Enum
from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime
from modules.appointments_module.domains.slot.Slot import Slot


class ScheduleStatus(Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Schedule:
    def __init__(
        self,
        doctor_id: ObjectId,
        month: int,
        year: int,
        title: str,
        is_repeated: bool,
        repeating: Dict[str, Any],
        slots: List[Slot],
        created_at: datetime,
        updated_at: datetime,
        status: ScheduleStatus = ScheduleStatus.PENDING,  # Статус за замовчуванням
        _id: Optional[ObjectId] = None,
    ):
        self.id = _id
        self.doctor_id = doctor_id
        self.month = month
        self.year = year
        self.title = title
        self.is_repeated = is_repeated
        self.repeating = repeating
        self.slots = slots
        self.status = status
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self) -> dict:
        data = {
            "doctorId": self.doctor_id,
            "month": self.month,
            "year": self.year,
            "title": self.title,
            "isRepeated": self.is_repeated,
            "repeating": self.repeating,
            "slots": [slot.to_dict() for slot in self.slots],
            "status": self.status.value if hasattr(self.status, "value") else self.status,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
        if self.id:
            data["_id"] = self.id
        return data

    @staticmethod
    def from_dict(data: dict) -> "Schedule":
        if not data:
            return None

        slots_data = data.get("slots", [])
        slots = [Slot.from_dict(s) for s in slots_data]

        raw_status = data.get("status", "PENDING")
        try:
            status = ScheduleStatus(raw_status)
        except ValueError:
            status = ScheduleStatus.PENDING

        return Schedule(
            _id=data.get("_id"),
            doctor_id=data.get("doctorId"),
            month=data.get("month"),
            year=data.get("year"),
            title=data.get("title"),
            is_repeated=data.get("isRepeated", False),
            repeating=data.get("repeating", {}),
            slots=slots,
            status=status,
            created_at=data.get("createdAt"),
            updated_at=data.get("updatedAt"),
        )
