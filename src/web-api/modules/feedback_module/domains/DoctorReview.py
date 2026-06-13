from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from typing import Optional
from datetime import datetime
from enum import Enum


class ReviewVisibility(str, Enum):
    PUBLIC = "PUBLIC"
    ANONYMOUS = "ANONYMOUS"


class DoctorReview(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: Optional[ObjectId] = Field(default=None, alias="_id")
    doctor_id: ObjectId
    patient_id: ObjectId
    message: str
    rating: int
    visibility: ReviewVisibility = ReviewVisibility.PUBLIC
    created_at: datetime = Field(default_factory=datetime.utcnow)
