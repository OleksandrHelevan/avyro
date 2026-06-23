from typing import List, Optional
from bson import ObjectId
from pymongo.collection import Collection
from modules.appointments_module.domains.appointment.Appointment import Appointment
from datetime import datetime
import json

class AppointmentRepository:
    def __init__(self, collection: Collection):
        self.collection = collection

    def create(self, appointment: Appointment) -> Appointment:
        doc = appointment.to_dict()
        result = self.collection.insert_one(doc)
        appointment.id = result.inserted_id
        return appointment

    def get_by_id(self, appointment_id: ObjectId) -> Optional[Appointment]:
        doc = self.collection.find_one({"_id": appointment_id})
        return Appointment.from_dict(doc) if doc else None

    def get_by_patient_id(self, patient_id: ObjectId) -> List[Appointment]:
        cursor = self.collection.find({"patientId": patient_id})
        return [Appointment.from_dict(doc) for doc in cursor]

    def get_by_doctor_id(self, doctor_id: ObjectId) -> List[Appointment]:
        cursor = self.collection.find({"doctorId": doctor_id})
        return [Appointment.from_dict(doc) for doc in cursor]

    def get_by_slot_id(self, slot_id: ObjectId) -> Optional[Appointment]:
        doc = self.collection.find_one({"slotId": slot_id})
        return Appointment.from_dict(doc) if doc else None

    def update_status(self, appointment_id: ObjectId, new_status: str) -> bool:
        result = self.collection.update_one(
            {"_id": appointment_id},
            {"$set": {"status": new_status, "updatedAt": datetime.utcnow()}}
        )
        return result.modified_count > 0

    def get_finished_before(self, before_time: datetime) -> List[Appointment]:
        cursor = self.collection.find({
            "status": "FINISHED",
            "to": {"$lte": before_time}
        })
        return [Appointment.from_dict(doc) for doc in cursor]

    def update_payment_status(
        self, appointment_id: ObjectId, payment_status: str, invoice_id: str = None
    ) -> bool:
        update = {
            "$set": {
                "paymentStatus": payment_status,
                "updatedAt": datetime.utcnow()
            }
        }
        if invoice_id:
            update["$set"]["invoiceId"] = invoice_id
        result = self.collection.update_one({"_id": appointment_id}, update)
        return result.modified_count > 0

    def update_payment_details(
        self,
        appointment_id: ObjectId,
        points_used: int,
        money_charged: float,
    ) -> bool:
        result = self.collection.update_one(
            {"_id": appointment_id},
            {
                "$set": {
                    "pointsUsed": points_used,
                    "moneyCharged": money_charged,
                    "updatedAt": datetime.utcnow(),
                }
            }
        )
        return result.modified_count > 0

    def delete(self, appointment_id: ObjectId) -> bool:
        result = self.collection.delete_one({"_id": appointment_id})
        return result.deleted_count > 0

    def add_note(self, appointment_id: ObjectId, note: dict) -> bool:
        doc = self.collection.find_one({"_id": appointment_id})
        if not doc:
            return False

        # Отримуємо існуючий список з рядка або створюємо порожній список
        raw_notes = doc.get("notes")
        if isinstance(raw_notes, str):
            current_notes = json.loads(raw_notes)
        else:
            current_notes = []

        current_notes.append(note)

        # Зберігаємо назад у базу як РЯДОК (String), який любить ваша валідація
        result = self.collection.update_one(
            {"_id": appointment_id},
            {
                "$set": {
                    "notes": json.dumps(current_notes, default=str),
                    "updatedAt": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

    def get_finished_by_patient_id(self, patient_id: ObjectId) -> List[Appointment]:
        cursor = self.collection.find({"patientId": patient_id, "status": "FINISHED"})
        return [Appointment.from_dict(doc) for doc in cursor]

    def count_finished_by_doctor(self, patient_id: ObjectId, doctor_id: ObjectId) -> int:
        return self.collection.count_documents({
            "patientId": patient_id,
            "doctorId": doctor_id,
            "status": "FINISHED",
        })

    def get_finished_by_specialization(self, patient_id: ObjectId, spec: str, user_repository) -> int:
        appointments = self.collection.find({"patientId": patient_id, "status": "FINISHED"})
        count = 0
        for doc in appointments:
            doctor_id = doc.get("doctorId")
            if not doctor_id:
                continue
            doctor = user_repository.find_by_id(doctor_id)
            if doctor and getattr(doctor, "specialization", None) == spec:
                count += 1
        return count

    def count_finished_in_period(
        self, patient_id: ObjectId, start: datetime, end: datetime
    ) -> int:
        return self.collection.count_documents({
            "patientId": patient_id,
            "status": "FINISHED",
            "updatedAt": {"$gte": start, "$lte": end},
        })
