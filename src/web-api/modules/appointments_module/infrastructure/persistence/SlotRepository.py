from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from pymongo.collection import Collection
from modules.appointments_module.domains.slot.Slot import Slot, SlotType


class SlotRepository:
    def __init__(self, collection: Collection):
        self.collection = collection

    def create(self, slot: Slot) -> Slot:
        data = slot.to_dict()
        result = self.collection.insert_one(data)
        slot.id = result.inserted_id
        return slot

    def get_by_id(self, slot_id: ObjectId) -> Optional[Slot]:
        doc = self.collection.find_one({"_id": slot_id})
        if not doc:
            return None
        return Slot.from_dict(doc)

    def get_available(self) -> List[Slot]:
        cursor = self.collection.find({"type": SlotType.AVAILABLE.value})
        return [Slot.from_dict(doc) for doc in cursor]

    def get_by_doctor_id(self, doctor_id: ObjectId) -> List[Slot]:
        cursor = self.collection.find({"doctorId": doctor_id})
        return [Slot.from_dict(doc) for doc in cursor]

    def get_by_time_range(self, start_time: datetime, end_time: datetime) -> List[Slot]:
        cursor = self.collection.find({
            "from": {
                "$gte": start_time,
                "$lte": end_time
            }
        })
        return [Slot.from_dict(doc) for doc in cursor]

    def update_status(self, slot_id: ObjectId, status: SlotType, appointment_id: Optional[ObjectId] = None) -> None:
        update_data = {
            "type": status.value,
            "updatedAt": datetime.now(timezone.utc)
        }
        if appointment_id:
            update_data["appointmentId"] = appointment_id

        self.collection.update_one(
            {"_id": slot_id},
            {"$set": update_data}
        )

    def delete_by_schedule(self, schedule_id: ObjectId) -> None:
        """Видаляє всі слоти, пов'язані з конкретним розкладом"""
        self.collection.delete_many({"scheduleId": schedule_id})
