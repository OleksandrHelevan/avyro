from pydantic import BaseModel, Field


class CreateAppointmentRequest(BaseModel):
    schedule_id: str
    slot_id: str
    discount: float = Field(default=0.0, ge=0.0, le=100.0)
    is_discount_used: bool = False
