from pydantic import BaseModel, Field
from enum import Enum

class PaymentMethod(str, Enum):
    MONEY = "MONEY"
    POINTS = "POINTS"
    MIXED = "MIXED"          

class CreateAccountRequest(BaseModel):
    pass


class TopUpBalanceRequest(BaseModel):
    amount: float = Field(..., gt=0, description="Сума поповнення (у гривнях)")
    payment_method_id: str = Field(..., description="pm_xxxx — ID способу оплати від Stripe.js")


class AddCardRequest(BaseModel):

    payment_method_id: str = Field(..., description="pm_xxxx від Stripe.js / тестового токена")
    set_as_default: bool = False


class SetPinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=6, description="Цифровий PIN")


class VerifyPinRequest(BaseModel):
    pin: str
