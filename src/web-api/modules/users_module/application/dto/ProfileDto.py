from pydantic import BaseModel, Field


PHONE_REGEX = r"^\+380\d{9}$"

class ProfileUpdateRequest(BaseModel):
    full_name: str = Field(..., min_length=2, description="ПІБ пацієнта є обов'язковим")
    phone: str = Field(..., pattern=PHONE_REGEX, description="Телефон у форматі +380XXXXXXXXX")

class ProfileUpdateResponse(BaseModel):
    status: str
    reward_issued: bool
    message: str
