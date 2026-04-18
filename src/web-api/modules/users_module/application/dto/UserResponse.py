from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from modules.users_module.domains.user.UserRole import UserRole


class ProfileResponse(BaseModel):
    fullName: str
    phone: Optional[str] = None
    specializationId: Optional[str] = None
    avatarUrl: Optional[str] = None


class UserResponse(BaseModel):
    id: str = Field(alias="_id")

    email: EmailStr
    role: UserRole
    isActive: bool

    profile: Optional[ProfileResponse] = None

    createdAt: datetime
    updatedAt: datetime
    lastLoginAt: Optional[datetime] = None

    class Config:
        populate_by_name = True
