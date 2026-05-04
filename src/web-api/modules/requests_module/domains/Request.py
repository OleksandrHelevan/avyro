from typing import Optional, Any, Dict
from bson import ObjectId
from datetime import datetime, UTC
from modules.requests_module.domains.RequestStatus import RequestStatus
from modules.requests_module.domains.RequestType import RequestType

class Request:
    def __init__(
        self,
        creator_id: Optional[ObjectId],
        type: RequestType,
        payload: Dict[str, Any],
        status: RequestStatus = RequestStatus.PENDING,
        admin_comment: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
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
        self.created_at = created_at or datetime.now(UTC)
        self.updated_at = updated_at or datetime.now(UTC)
        self.processed_at = processed_at
        self.processed_by = processed_by

    def to_dict(self) -> dict:
        data = {
            "creatorId": str(self.creator_id) if self.creator_id else None,
            "type": self.type.value,
            "status": self.status.value,
            "payload": self.payload,
            "adminComment": self.admin_comment,
            "createdAt": self.created_at.isoformat() if hasattr(self.created_at, "isoformat") else self.created_at,
            "updatedAt": self.updated_at.isoformat() if hasattr(self.updated_at, "isoformat") else self.updated_at,
            "processedAt": self.processed_at.isoformat() if hasattr(self.processed_at, "isoformat") else None,
            "processedBy": str(self.processed_by) if self.processed_by else None,
        }
        if self.id:
            data["_id"] = str(self.id)
        return data

    @staticmethod
    def from_dict(data: dict) -> Optional["Request"]:
        if not data:
            return None

        def parse_datetime(value):
            if not value:
                return None
            if isinstance(value, datetime):
                return value
            if isinstance(value, str):
                try:
                    return datetime.fromisoformat(value.replace("Z", "+00:00"))
                except ValueError:
                    return None
            return None

        def parse_object_id(value):
            if not value:
                return None
            if isinstance(value, ObjectId):
                return value
            try:
                return ObjectId(str(value))
            except Exception:
                return None

        return Request(
            _id=parse_object_id(data.get("_id")),
            creator_id=parse_object_id(data.get("creatorId")),
            type=RequestType(data.get("type")),
            status=RequestStatus(data.get("status")),
            payload=data.get("payload", {}),
            admin_comment=data.get("adminComment"),
            created_at=parse_datetime(data.get("createdAt")),
            updated_at=parse_datetime(data.get("updatedAt")),
            processed_at=parse_datetime(data.get("processedAt")),
            processed_by=parse_object_id(data.get("processedBy")),
        )
