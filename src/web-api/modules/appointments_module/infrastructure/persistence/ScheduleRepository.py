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

    def get_by_month(self, doctor_id: ObjectId, year: int, month: int) -> Optional[Schedule]:
        doc = self.collection.find_one({
            "doctorId": doctor_id,
            "year": year,
            "month": month
        })
        return Schedule.from_dict(doc) if doc else None

    def book_slot(self, schedule_id: ObjectId, slot_id: ObjectId, appointment_id: ObjectId) -> bool:
        """Атомарне бронювання слота всередині масиву"""
        result = self.collection.update_one(
            {
                "_id": schedule_id,
                "slots.slotId": slot_id,
                "slots.type": "AVAILABLE" # Перевірка availability для запобігання Race Condition
            },
            {
                "$set": {
                    "slots.$.type": "BLOCKED",
                    "slots.$.appointmentId": appointment_id,
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
        )
        return result.modified_count > 0

    def get_by_id(self, schedule_id: ObjectId) -> Optional[Schedule]:
        doc = self.collection.find_one({"_id": schedule_id})
        return Schedule.from_dict(doc) if doc else None
