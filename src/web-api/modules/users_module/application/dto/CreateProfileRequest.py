from typing import Optional

from pydantic import BaseModel


class CreateProfileRequest(BaseModel):
    fullName: str
    phone: Optional[str] = None
    specializationId: Optional[str] = None
    avatarUrl: Optional[str] = None
