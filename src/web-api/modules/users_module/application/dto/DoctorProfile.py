from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class SlotResponseDTO(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    slotId: str
    from_time: datetime = Field(alias="from")
    to_time: datetime = Field(alias="to")
    type: str
    appointmentId: Optional[str] = None

class ScheduleResponse(BaseModel):
    id: str
    doctorId: str
    month: int
    year: int
    title: str
    isRepeated: bool
    repeating: Dict[str, Any]
    status: str
    slots: List[SlotResponseDTO]
    createdAt: datetime
    updatedAt: datetime


class DoctorProfileUpdateRequest(BaseModel):
    fullName: str = Field(..., min_length=3, description="Введіть коректне ПІБ")
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    specialization_id: str

class DoctorProfileUpdateResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    email: str
    isActive: bool
    fullName: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    createdAt: Optional[datetime] = None
    lastLoginAt: Optional[datetime] = None

class DoctorProfileResponse(DoctorProfileUpdateResponse):
    specializationName: Optional[str] = None
    schedule: Optional[List[ScheduleResponse]] = []
