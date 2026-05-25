from enum import Enum
from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime
from modules.appointments_module.domains.slot.Slot import Slot
from pydantic import BaseModel, Field
from typing import Optional
from pydantic import ConfigDict


class ScheduleStatus(Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Schedule(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: Optional[ObjectId] = Field(default=None, alias="_id")
    doctor_id: Optional[ObjectId] = None
    month: Optional[int] = None
    year: Optional[int] = None
    title: Optional[str] = None
    is_repeated: bool = False
    repeating: dict = Field(default_factory=dict)
    slots: list = Field(default_factory=list)
    status: ScheduleStatus = ScheduleStatus.PENDING
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    price_per_slot: float = 0.0

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
            "pricePerSlot": self.price_per_slot,
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
            id=data.get("_id"),
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
            price_per_slot=data.get("pricePerSlot", 0.0)
        )




