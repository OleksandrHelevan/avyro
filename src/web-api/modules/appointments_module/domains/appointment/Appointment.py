from enum import Enum
from typing import Optional, List
from bson import ObjectId
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict

class NoteSource(str, Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"

class NoteType(str, Enum):
    SPECIFICATION = "SPECIFICATION"
    RECEIPT = "RECEIPT"

class AppointmentNote(BaseModel):
    source: NoteSource
    message: str
    type: NoteType
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AppointmentStatus(Enum):
    PLANNED = "PLANNED"
    RESERVED = "RESERVED"
    FINISHED = "FINISHED"
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
    notes: List[AppointmentNote] = Field(default_factory=list)

    def to_dict(self) -> dict:
        now = datetime.now(timezone.utc)
        data = {
            "patientId": self.patient_id,
            "slotId": self.slot_id,
            "doctorId": self.doctor_id,
            "from": self.from_time,
            "to": self.to_time,
            "status": self.status.value,
            "createdAt": self.created_at or now,
            "updatedAt": self.updated_at or now,
            "paymentStatus": self.payment_status,
            "basePrice": self.base_price,
            "finalPrice": self.final_price,
            "appointmentType": self.appointment_type,
            "bookedAt": self.booked_at or now,
            "notes": [
                {
                    "source": n.source.value,
                    "message": n.message,
                    "type": n.type.value,
                    "createdAt": n.created_at,
                }
                for n in self.notes
            ],
        }
        if self.id:
            data["_id"] = self.id
        return data

    @staticmethod
    def from_dict(data: dict) -> Optional["Appointment"]:
        if not data:
            return None
        notes = []
        for n in data.get("notes") or []:
            try:
                notes.append(AppointmentNote(
                    source=NoteSource(n.get("source", "PATIENT")),
                    message=n.get("message", ""),
                    type=NoteType(n.get("type", "SPECIFICATION")),
                    created_at=n.get("createdAt", datetime.now(timezone.utc)),
                ))
            except Exception:
                pass
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
            notes=notes,
        )
