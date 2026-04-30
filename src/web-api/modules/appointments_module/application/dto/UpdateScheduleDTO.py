from pydantic import BaseModel
from typing import Optional
from .RepeatingConfigDTO import RepeatingConfigDTO

class UpdateScheduleDTO(BaseModel):
    title: Optional[str] = None
    isRepeated: Optional[bool] = None
    repeating: Optional[RepeatingConfigDTO] = None
