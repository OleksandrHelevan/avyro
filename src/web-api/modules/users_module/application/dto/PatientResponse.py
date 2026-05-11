from typing import  List

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class RewardItemResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    title: Optional[str] = None

    type: str
    points: int
    source: str
    description: Optional[str] = None
    createdAt: datetime

class PatientResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(alias="_id")
    email: str
    isActive: bool
    fullName: Optional[str] = None
    phone: Optional[str] = None
    avatarUrl: Optional[str] = None
    createdAt: datetime
    lastLoginAt: Optional[datetime] = None
    rewards: List[RewardItemResponse] = [] # Додаємо це поле

    class RewardDTO(BaseModel):
        id: str = Field(alias="_id")

        title: str = Field(alias="source")

        type: str
        points: int
        description: str
        createdAt: datetime

        model_config = ConfigDict(
            populate_by_name=True,
            from_attributes=True
        )



