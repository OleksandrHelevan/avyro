from pydantic import BaseModel, Field
from typing import List, Optional

class RepeatingConfigDTO(BaseModel):
    type: str = Field(..., example="WEEKLY")
    daysOfWeek: Optional[List[int]] = Field(None, example=[1, 3, 5])
    startTime: str = Field(..., example="09:00")
    endTime: str = Field(..., example="18:00")
    slotDuration: int = Field(..., example=30)
    timezone: str = Field(default="UTC")

