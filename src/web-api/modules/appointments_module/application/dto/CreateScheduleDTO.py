from pydantic import BaseModel, Field
from .RepeatingConfigDTO import RepeatingConfigDTO

class CreateScheduleDTO(BaseModel):
    doctorId: str
    month: int = Field(..., ge=1, le=12, example=5)
    year: int = Field(..., ge=2024, example=2026)
    title: str
    isRepeated: bool
    repeating: RepeatingConfigDTO
