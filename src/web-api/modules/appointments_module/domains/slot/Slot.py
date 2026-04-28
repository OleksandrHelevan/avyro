from typing import Optional
from bson import ObjectId
from datetime import datetime
from enum import Enum

class SlotType(Enum):
    AVAILABLE = "AVAILABLE"
    BLOCKED = "BLOCKED"

class Slot:
    def __init__(
        self,
        schedule_id: ObjectId,
        doctor_id: ObjectId,
        from_time: datetime,
        to_time: datetime,
        slot_type: SlotType,
        created_at: datetime,
        _id: Optional[ObjectId] = None,
        appointment_id: Optional[ObjectId] = None,
    ):
        self.id = _id
        self.schedule_id = schedule_id
        self.doctor_id = doctor_id
        self.from_time = from_time
        self.to_time = to_time
        self.slot_type = slot_type
        self.appointment_id = appointment_id
        self.created_at = created_at

    def to_dict(self) -> dict:
        data = {
            "scheduleId": self.schedule_id,
            "doctorId": self.doctor_id,
            "from": self.from_time,
            "to": self.to_time,
            "type": self.slot_type.value if hasattr(self.slot_type, "value") else self.slot_type,
            "appointmentId": self.appointment_id,
            "createdAt": self.created_at,
        }

        if self.id:
            data["_id"] = self.id

        return data

    @staticmethod
    def from_dict(data: dict) -> "Slot":
        if not data:
            return None

        raw_type = data.get("type")
        try:
            slot_type = SlotType(raw_type) if raw_type else SlotType.AVAILABLE
        except ValueError:
            slot_type = raw_type

        return Slot(
            _id=data.get("_id"),
            schedule_id=data.get("scheduleId"),
            doctor_id=data.get("doctorId"),
            from_time=data.get("from"),
            to_time=data.get("to"),
            slot_type=slot_type,
            appointment_id=data.get("appointmentId"),
            created_at=data.get("createdAt"),
        )
