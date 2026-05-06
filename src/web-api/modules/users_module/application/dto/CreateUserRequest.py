from pydantic import BaseModel, EmailStr
from typing import Optional
from modules.users_module.application.dto.CreateProfileRequest import CreateProfileRequest
from modules.users_module.domains.user.UserRole import UserRole


class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    isActive: bool = True
    profile: Optional[CreateProfileRequest] = None

    model_config = ConfigDict(extra='forbid')
