from bson import ObjectId
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class CardInfo(BaseModel):
    """Прив'язана карта (токенізована через Stripe — без реальних номерів у нас)"""
    stripe_payment_method_id: str   # pm_xxxx від Stripe
    last4: str                       # Останні 4 цифри для відображення
    brand: str                       # visa / mastercard / etc
    exp_month: int
    exp_year: int
    is_default: bool = False


class Account(BaseModel):
    id: Optional[ObjectId] = Field(default=None, alias="_id")
    user_id: ObjectId                         # Власник акаунту
    stripe_customer_id: str                   # cus_xxxx — Stripe Customer ID
    balance: float = 0.0                      # Баланс у системі (гривні / USD — залежно від налаштувань)
    pin: Optional[str] = None                 # Хешований PIN (bcrypt)
    cards: List[CardInfo] = []                # Прив'язані картки
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        populate_by_name = True
        json_encoders = {ObjectId: str}
