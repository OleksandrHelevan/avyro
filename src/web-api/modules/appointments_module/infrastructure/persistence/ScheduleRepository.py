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
        query = {
            "_id": schedule_id,
            "slots": {
                "$elemMatch": {
                    "slotId": slot_id,
                    "type": "AVAILABLE"
                }
            }
        }

        update_query = {
            "$set": {
                "slots.$.type": "RESERVED",
                "slots.$.appointmentId": appointment_id,
                "updatedAt": datetime.now(timezone.utc)
            }
        }

        result = self.collection.update_one(query, update_query)

        if result.modified_count == 0:
            query_string = {
                "_id": schedule_id,
                "slots": {
                    "$elemMatch": {
                        "slotId": str(slot_id),
                        "type": "AVAILABLE"
                    }
                }
            }
            update_query_string = {
                "$set": {
                    "slots.$.type": "RESERVED",
                    "slots.$.appointmentId": str(appointment_id),
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
            result = self.collection.update_one(query_string, update_query_string)

        if result.modified_count == 0:
            print(f"⚠️ УВАГА: Не вдалося оновити слот! Слот з ID {slot_id} не знайдено або він вже зайнятий.")

        return result.modified_count > 0

    def get_by_id(self, schedule_id: ObjectId) -> Optional[Schedule]:
        doc = self.collection.find_one({"_id": schedule_id})
        return Schedule.from_dict(doc) if doc else None

    def get_by_slot_id(self, slot_id: ObjectId):
        doc = self.collection.find_one({"slots.slotId": slot_id})
        return Schedule.from_dict(doc) if doc else None

    def get_by_doctor_id(self, doctor_id: ObjectId) -> List[Schedule]:
        docs = list(self.collection.find({"doctorId": doctor_id}))

        if not docs:
            docs = list(self.collection.find({"doctorId": str(doctor_id)}))

        return [Schedule.from_dict(doc) for doc in docs]
