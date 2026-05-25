from enum import Enum
from typing import Optional
from bson import ObjectId
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict


class AppointmentStatus(Enum):
    PLANNED = "PLANNED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"


class Appointment(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: Optional[ObjectId] = Field(default=None, alias="_id")
    patient_id: Optional[ObjectId] = None
    slot_id: Optional[ObjectId] = None
    doctor_id: Optional[ObjectId] = None
    from_time: Optional[datetime] = None
    to_time: Optional[datetime] = None
    status: AppointmentStatus = AppointmentStatus.PLANNED
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    payment_status: str = "PENDING"
    base_price: float = 0.0
    discount: float = 0.0
    is_discount_used: bool = False
    final_price: float = 0.0
    appointment_type: str = "VISIT"
    booked_at: Optional[datetime] = None

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
            id=data.get("_id"),
            patient_id=data.get("patientId"),
            slot_id=data.get("slotId"),
            doctor_id=data.get("doctorId"),
            from_time=data.get("from"),
            to_time=data.get("to"),
            status=AppointmentStatus(data.get("status", "PLANNED")),
            created_at=data.get("createdAt"),
            updated_at=data.get("updatedAt"),
        )
