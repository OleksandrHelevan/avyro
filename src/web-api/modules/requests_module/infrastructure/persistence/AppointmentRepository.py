from typing import List, Optional
from bson import ObjectId
from pymongo.collection import Collection
from modules.appointments_module.domains.appointment.Appointment import Appointment


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
