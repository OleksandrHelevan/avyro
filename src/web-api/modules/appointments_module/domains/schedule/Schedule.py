from typing import Optional, List, Dict, Any
from bson import ObjectId
from datetime import datetime

class Schedule:
    def __init__(
        self,
        doctor_id: ObjectId,
        title: str,
        is_repeated: bool,
        repeating: Dict[str, Any],
        created_at: datetime,
        updated_at: datetime,
        _id: Optional[ObjectId] = None,
    ):
        self.id = _id
        self.doctor_id = doctor_id
        self.title = title
        self.is_repeated = is_repeated
        self.repeating = repeating
        self.created_at = created_at
        self.updated_at = updated_at

    def to_dict(self) -> dict:
        data = {
            "doctorId": self.doctor_id,
            "title": self.title,
            "isRepeated": self.is_repeated,
            "repeating": {
                "type": self.repeating.get("type"),
                "daysOfWeek": self.repeating.get("daysOfWeek"),
                "startTime": self.repeating.get("startTime"),
                "endTime": self.repeating.get("endTime"),
                "slotDuration": self.repeating.get("slotDuration"),
                "timezone": self.repeating.get("timezone", "UTC")
            },
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

        return Schedule(
            _id=data.get("_id"),
            doctor_id=data.get("doctorId"),
            title=data.get("title"),
            is_repeated=data.get("isRepeated", False),
            repeating=data.get("repeating", {}),
            created_at=data.get("createdAt"),
            updated_at=data.get("updatedAt"),
        )
