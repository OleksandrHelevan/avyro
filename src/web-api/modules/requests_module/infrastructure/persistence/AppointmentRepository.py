from typing import List, Optional
from bson import ObjectId
from pymongo.collection import Collection
from modules.appointments_module.domains.appointment.Appointment import Appointment
from datetime import datetime


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

    def get_by_slot_id(self, slot_id: ObjectId) -> Optional[Appointment]:
        doc = self.collection.find_one({"slotId": slot_id})
        return Appointment.from_dict(doc) if doc else None

    def get_finished_by_patient_id(self, patient_id: ObjectId) -> list:
        return list(self.collection.find({
            "patient_id": patient_id,
            "status": "FINISHED"
        }))

    def count_finished_in_period(self, patient_id: ObjectId,
                                 start: datetime, end: datetime) -> int:
        return self.collection.count_documents({
            "patient_id": patient_id,
            "status": "FINISHED",
            "from_time": {"$gte": start, "$lte": end}
        })

    def count_finished_by_doctor(self, patient_id: ObjectId,
                                 doctor_id: ObjectId) -> int:
        return self.collection.count_documents({
            "patient_id": patient_id,
            "doctor_id": doctor_id,
            "status": "FINISHED"
        })

    def get_finished_by_specialization(self, patient_id: ObjectId,
                                       specialization: str,
                                       user_repo) -> int:
        doctors = user_repo.get_by_specialization(specialization)
        doctor_ids = [d.id for d in doctors]
        return self.collection.count_documents({
            "patient_id": patient_id,
            "doctor_id": {"$in": doctor_ids},
            "status": "FINISHED"
        })
