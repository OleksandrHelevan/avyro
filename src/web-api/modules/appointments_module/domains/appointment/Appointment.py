from enum import Enum
from typing import Optional
from bson import ObjectId
from datetime import datetime, timezone


class AppointmentStatus(Enum):
    PLANNED = "PLANNED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class Appointment:
    def __init__(
        self,
        patient_id: ObjectId,
        slot_id: ObjectId,
        doctor_id: ObjectId,
        from_time: datetime,
        to_time: datetime,
        status: AppointmentStatus = AppointmentStatus.PLANNED,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        _id: Optional[ObjectId] = None,
    ):
        self.id = _id
        self.patient_id = patient_id
        self.slot_id = slot_id
        self.doctor_id = doctor_id
        self.from_time = from_time
        self.to_time = to_time
        self.status = status
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)
        self.status = status or AppointmentStatus.PLANNED
        self.payment_status = "PENDING"
        self.base_price = 0
        self.final_price = 0
        self.appointment_type = "VISIT"
        self.booked_at = datetime.now(timezone.utc)

    def to_dict(self) -> dict:
        data = {
            "patientId": self.patient_id,
            "slotId": self.slot_id,
            "doctorId": self.doctor_id,
            "from": self.from_time,
            "to": self.to_time,
            "status": self.status.value,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
            "status": self.status.value,
            "paymentStatus": self.payment_status,
            "basePrice": self.base_price,
            "finalPrice": self.final_price,
            "appointmentType": self.appointment_type,
            "bookedAt": self.booked_at,

        }
        if self.id:
            data["_id"] = self.id
        return data

    @staticmethod
    def from_dict(data: dict) -> Optional["Appointment"]:
        if not data:
            return None
        return Appointment(
            _id=data.get("_id"),
            patient_id=data.get("patientId"),
            slot_id=data.get("slotId"),
            doctor_id=data.get("doctorId"),
            from_time=data.get("from"),
            to_time=data.get("to"),
            status=AppointmentStatus(data.get("status", "PLANNED")),
            created_at=data.get("createdAt"),
            updated_at=data.get("updatedAt"),
        )


