from pydantic import BaseModel
from .RepeatingConfigDTO import RepeatingConfigDTO

class CreateScheduleDTO(BaseModel):
    doctorId: str
    title: str
    isRepeated: bool
    repeating: RepeatingConfigDTO
