from pydantic import BaseModel, Field

class DoctorProfileUpdateRequest(BaseModel):
    full_name: str = Field(
        ...,
        min_length=3,
        description="ПІБ лікаря (мінімум 3 символи)"
    )
    specialization_id: str = Field(
        ...,
        description="ID спеціалізації з БД (MongoDB ObjectId у форматі рядка)"
    )

class DoctorProfileResponse(BaseModel):
    status: str
    message: str
