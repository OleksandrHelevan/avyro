from datetime import datetime, timezone
from typing import List, Optional
from bson import ObjectId
from pymongo.collection import Collection
from modules.appointments_module.domains.schedule.Schedule import Schedule


class ScheduleRepository:
    def __init__(self, collection: Collection):
        self.collection = collection

    def create(self, schedule: Schedule) -> Schedule:
        data = schedule.to_dict()
        result = self.collection.insert_one(data)
        schedule.id = result.inserted_id
        return schedule

    def get_by_id(self, schedule_id: ObjectId) -> Optional[Schedule]:
        doc = self.collection.find_one({"_id": schedule_id})
        if not doc:
            return None
        return Schedule.from_dict(doc)

    def get_by_doctor_id(self, doctor_id: ObjectId) -> List[Schedule]:
        cursor = self.collection.find({"doctorId": doctor_id})
        return [Schedule.from_dict(doc) for doc in cursor]

    def get_active_repeated_schedules(self) -> List[Schedule]:
        cursor = self.collection.find({"isRepeated": True})
        return [Schedule.from_dict(doc) for doc in cursor]

    def update(self, schedule_id: ObjectId, update_data: dict) -> bool:
        update_data["updatedAt"] = datetime.now(timezone.utc)
        result = self.collection.update_one(
            {"_id": schedule_id},
            {"$set": update_data}
        )
        return result.modified_count > 0

    def delete(self, schedule_id: ObjectId) -> bool:
        result = self.collection.delete_one({"_id": schedule_id})
        return result.deleted_count > 0

    def find_by_type(self, repeat_type: str) -> List[Schedule]:
        cursor = self.collection.find({"repeating.type": repeat_type})
        return [Schedule.from_dict(doc) for doc in cursor]
