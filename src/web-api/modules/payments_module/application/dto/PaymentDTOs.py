from pydantic import BaseModel, Field


class CreateAccountRequest(BaseModel):
    """Ініціалізація акаунту для юзера (викликається при реєстрації або вручну)"""
    pass  # user_id береться з JWT


class TopUpBalanceRequest(BaseModel):
    """Поповнення балансу через Stripe PaymentIntent"""
    amount: float = Field(..., gt=0, description="Сума поповнення (у гривнях)")
    payment_method_id: str = Field(..., description="pm_xxxx — ID способу оплати від Stripe.js")


class AddCardRequest(BaseModel):
    """Прив'язати нову картку через Stripe SetupIntent"""
    payment_method_id: str = Field(..., description="pm_xxxx від Stripe.js / тестового токена")
    set_as_default: bool = False


class SetPinRequest(BaseModel):
    pin: str = Field(..., min_length=4, max_length=6, description="Цифровий PIN")


class VerifyPinRequest(BaseModel):
    pin: str
