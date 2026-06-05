from bson import ObjectId
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CardInfo(BaseModel):
    stripe_payment_method_id: str
    last4: str
    brand: str
    exp_month: int
    exp_year: int
    is_default: bool = False


class Account(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    user_id: ObjectId
    stripe_customer_id: str
    balance: float = 0.0
    pin: Optional[str] = None
    cards: List[CardInfo] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
