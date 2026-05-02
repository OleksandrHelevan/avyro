from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from modules.users_module.domains.reward.Reward import RewardType, RewardSource

class RewardResponse(BaseModel):
    id: str = Field(alias="_id")
    type: RewardType
    points: int
    source: RewardSource
    description: str
    createdAt: datetime

class AddPatientProfileRequest(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None  # Дефолтно буде None, якщо не передати
    address: Optional[str] = None    # Нове поле

class PatientResponse(BaseModel):
    id: str = Field(alias="_id")
    email: str
    fullName: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    address: Optional[str] = None
    isProfileCompleted: bool = False             # Статус заповненості
    rewards: List[RewardResponse] = Field(default_factory=list) # Масив нагород
