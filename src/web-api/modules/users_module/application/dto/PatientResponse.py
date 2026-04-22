from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class PatientResponse(BaseModel):
    id: str = Field(alias="_id")
    email: str
    isActive: bool
    fullName: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    createdAt: datetime
    lastLoginAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
