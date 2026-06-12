from pydantic import BaseModel
from typing import Optional

class DoctorListItemResponse(BaseModel):
    id: str
    email: str
    fullName: Optional[str] = None
    avatarUrl: Optional[str] = None
    specializationName: Optional[str] = None
