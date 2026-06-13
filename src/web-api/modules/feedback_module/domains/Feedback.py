from pydantic import BaseModel, Field, ConfigDict
from bson import ObjectId
from typing import Optional
from datetime import datetime


class Feedback(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True, populate_by_name=True)

    id: Optional[ObjectId] = Field(default=None, alias="_id")
    user_id: ObjectId
    message: str
    rating: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
