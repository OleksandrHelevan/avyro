from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class ReviewVisibility(str, Enum):
    PUBLIC = "PUBLIC"
    ANONYMOUS = "ANONYMOUS"


class CreateFeedbackRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    rating: Optional[int] = Field(default=None, ge=1, le=5)


class CreateDoctorReviewRequest(BaseModel):
    doctor_id: str
    message: str = Field(..., min_length=1, max_length=2000)
    rating: int = Field(..., ge=1, le=5)
    visibility: ReviewVisibility = ReviewVisibility.PUBLIC
