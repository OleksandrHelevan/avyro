from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SlotResponseDTO(BaseModel):
    slotId: str
    from_time: datetime = Field(alias="from")
    to_time: datetime = Field(alias="to")
    type: str
    appointmentId: Optional[str] = None

    class Config:
        populate_by_name = True

class ScheduleResponse(BaseModel):
    id: str
    doctorId: str
    month: int
    year: int
    title: str
    isRepeated: bool
    repeating: Dict[str, Any]
    status: str
    slots: List[SlotResponseDTO]
    createdAt: datetime
    updatedAt: datetime
