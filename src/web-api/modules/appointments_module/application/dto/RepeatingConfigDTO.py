from pydantic import BaseModel, Field
from typing import List, Optional

class RepeatingConfigDTO(BaseModel):
    type: str = Field(..., json_schema_extra={"example": "WEEKLY"})
    daysOfWeek: Optional[List[int]] = Field(None, json_schema_extra={"example": [1, 3, 5]})
    startTime: str = Field(..., json_schema_extra={"example": "09:00"})
    endTime: str = Field(..., json_schema_extra={"example": "18:00"})
    slotDuration: int = Field(..., json_schema_extra={"example": 30})
    timezone: str = Field(default="UTC")

