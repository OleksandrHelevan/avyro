from typing import List, Optional
from bson import ObjectId
from pymongo.collection import Collection
from datetime import datetime, UTC

from modules.requests_module.domains.Request import (Request, RequestStatus, RequestType)


class RequestRepository:
    def __init__(self, collection: Collection):
        self.collection = collection

    def create(self, request: Request) -> Request:
        doc = request.to_dict()
        result = self.collection.insert_one(doc)
        request.id = result.inserted_id
        return request

    def get_by_id(self, request_id: ObjectId) -> Optional[Request]:
        data = self.collection.find_one({"_id": request_id})
        return Request.from_dict(data) if data else None

    def update_status(
        self,
        request_id: ObjectId,
        status: RequestStatus,
        admin_id: ObjectId,
        comment: str = None
    ) -> bool:
        result = self.collection.update_one(
            {"_id": request_id},
            {
                "$set": {
                    "status": status.value,
                    "processedBy": admin_id,
                    "processedAt": datetime.now(UTC),
                    "adminComment": comment,
                    "updatedAt": datetime.now(UTC)
                }
            }
        )

        return result.modified_count > 0

    def get_requests_by_type(self, request_type: RequestType) -> List[Request]:
        cursor = (
            self.collection
            .find({"type": request_type.value})
            .sort("createdAt", -1)
        )

        return [Request.from_dict(doc) for doc in cursor]

    def get_active_registration_by_email(self, email: str) -> Optional[Request]:
        data = self.collection.find_one({
            "type": RequestType.DOCTOR_REGISTRATION.value,
            "status": {
                "$in": [
                    RequestStatus.PENDING.value,
                    RequestStatus.APPROVED.value
                ]
            },
            "payload.email": email
        })

        return Request.from_dict(data) if data else None

    def get_active_specialization_by_name(self, name: str) -> Optional[Request]:
        data = self.collection.find_one({
            "type": RequestType.SPECIALIZATION_CREATION.value,
            "status": {
                "$in": [
                    RequestStatus.PENDING.value,
                    RequestStatus.APPROVED.value
                ]
            },
            "payload.name": name
        })

        return Request.from_dict(data) if data else None
