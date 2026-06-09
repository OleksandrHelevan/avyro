from pydantic import BaseModel, Field
from typing import Optional


class CreateFeedbackRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    rating: Optional[int] = Field(default=None, ge=1, le=5)
