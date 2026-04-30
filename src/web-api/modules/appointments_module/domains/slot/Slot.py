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
        from_time: datetime,
        to_time: datetime,
        slot_type: SlotType,
        _id: Optional[ObjectId] = None,
        appointment_id: Optional[ObjectId] = None,
    ):
        self.id = _id or ObjectId()
        self.from_time = from_time
        self.to_time = to_time
        self.slot_type = slot_type
        self.appointment_id = appointment_id

    def to_dict(self) -> dict:
        return {
            "slotId": self.id,  # Внутрішній ID слота в масиві
            "from": self.from_time,
            "to": self.to_time,
            "type": self.slot_type.value if hasattr(self.slot_type, "value") else self.slot_type,
            "appointmentId": self.appointment_id,
        }

    @staticmethod
    def from_dict(data: dict) -> "Slot":
        if not data: return None
        return Slot(
            _id=data.get("slotId"),
            from_time=data.get("from"),
            to_time=data.get("to"),
            slot_type=SlotType(data.get("type")),
            appointment_id=data.get("appointmentId"),
        )
