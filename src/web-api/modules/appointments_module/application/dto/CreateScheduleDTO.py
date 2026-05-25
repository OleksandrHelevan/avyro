from pydantic import BaseModel, Field
from .RepeatingConfigDTO import RepeatingConfigDTO
from typing import Optional
from datetime import datetime


class CreateScheduleDTO(BaseModel):
    doctorId: str
    month: int = Field(..., ge=1, le=12, json_schema_extra={"example": 5})
    year: int = Field(..., ge=2024, json_schema_extra={"example": 2026})
    title: str
    isRepeated: bool
    repeating: RepeatingConfigDTO
    pricePerSlot: float = Field(default=0.0, ge=0)
