from pydantic import BaseModel
from typing import Optional


class AddPatientProfileRequest(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None

    class Config:
        extra = "forbid"
