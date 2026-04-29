from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DoctorProfileUpdateRequest(BaseModel):
    fullName: str = Field(..., min_length=3, description="Введіть коректне ПІБ")
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    specialization_id: str

class DoctorProfileUpdateResponse(BaseModel):
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
