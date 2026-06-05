from enum import Enum
from typing import Optional, Any, Dict
from bson import ObjectId
from datetime import datetime, timezone

class RequestType(Enum):
    DOCTOR_REGISTRATION = "DOCTOR_REGISTRATION"
    SCHEDULE_CREATION = "SCHEDULE_CREATION"

class RequestStatus(Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class Request:
    def __init__(
        self,
        creator_id: ObjectId,
        type: RequestType,
        payload: Dict[str, Any],
        status: RequestStatus = RequestStatus.PENDING,
        admin_comment: Optional[str] = None,
        created_at: datetime = None,
        updated_at: datetime = None,
        _id: Optional[ObjectId] = None,
        processed_at: Optional[datetime] = None,
        processed_by: Optional[ObjectId] = None,
    ):
        self.id = _id
        self.creator_id = creator_id
        self.type = type
        self.status = status
        self.payload = payload
        self.admin_comment = admin_comment
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)
        self.processed_at = processed_at
        self.processed_by = processed_by

    def to_dict(self) -> dict:
        data = {
            "creatorId": str(self.creator_id) if self.creator_id else None,
            "type": self.type.value if hasattr(self.type, "value") else self.type,
            "status": self.status.value if hasattr(self.status, "value") else self.status,
            "payload": self.payload,
            "adminComment": self.admin_comment,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
            "processedAt": self.processed_at,
            "processedBy": str(self.processed_by) if self.processed_by else None,
        }
        if self.id:
            data["_id"] = str(self.id)
        return data

    @staticmethod
    def from_dict(data: dict) -> "Request":
        if not data:
            return None
        return Request(
            _id=data.get("_id"),
            creator_id=data.get("creatorId"),
            type=RequestType(data.get("type")),
            status=RequestStatus(data.get("status")),
            payload=data.get("payload", {}),
            admin_comment=data.get("adminComment"),
            created_at=data.get("createdAt"),
            updated_at=data.get("updatedAt"),
            processed_at=data.get("processedAt"),
            processed_by=data.get("processedBy"),
        )
