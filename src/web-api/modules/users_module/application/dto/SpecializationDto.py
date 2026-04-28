from pydantic import BaseModel, Field
from typing import Optional

class CreateSpecializationRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Назва медичної спеціалізації")
    description: Optional[str] = Field("", description="Опис спеціалізації (опціонально)")

class SpecializationResponse(BaseModel):
    id: str = Field(alias="_id")
    name: str
    description: str
