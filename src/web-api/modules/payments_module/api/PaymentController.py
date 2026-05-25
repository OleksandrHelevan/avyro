from fastapi import APIRouter, Depends, HTTPException, status
from modules.payments_module.application.AccountService import AccountService
from modules.payments_module.application.dto.PaymentDTOs import (
    TopUpBalanceRequest,
    AddCardRequest,
    SetPinRequest,
    VerifyPinRequest,
)
from config.security import get_current_user
router = APIRouter(prefix="/payments", tags=["payments"])


def get_account_service() -> AccountService:
    from config.db import db
    from modules.payments_module.infrastructure.persistence.AccountRepository import AccountRepository
    from modules.payments_module.application.StripeService import StripeService
    return AccountService(AccountRepository(db["Accounts"]), StripeService())
# ── Акаунт ──────────────────────────────────────────────────────────────────

@router.post("/account", status_code=status.HTTP_201_CREATED)
async def create_account(
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
    """Створити платіжний акаунт для поточного юзера (або повернути існуючий)."""
    account = await service.get_or_create_account(
        user_id=current_user["sub"],
        email=current_user.get("email", ""),
        name=current_user.get("name", ""),
    )
    return {"stripe_customer_id": account.stripe_customer_id, "balance": account.balance}


@router.get("/account")
async def get_account(
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
    """Отримати інформацію про акаунт (баланс, карти)."""
    account = await service.get_account(current_user["sub"])
    return {
        "balance": account.balance,
        "cards": [
            {
                "last4": c.last4,
                "brand": c.brand,
                "exp_month": c.exp_month,
                "exp_year": c.exp_year,
                "is_default": c.is_default,
                "payment_method_id": c.stripe_payment_method_id,
            }
            for c in account.cards
        ],
        "has_pin": account.pin is not None,
    }


# ── Поповнення балансу ───────────────────────────────────────────────────────

@router.post("/account/top-up")
async def top_up_balance(
    dto: TopUpBalanceRequest,
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
    """
    Поповнити баланс через Stripe.

    Тестові картки Stripe:
      - pm_card_visa              → завжди успішно
      - pm_card_chargeDeclined    → завжди відхиляється

    Або спочатку створи PaymentMethod через Stripe.js / curl:
      curl https://api.stripe.com/v1/payment_methods \\
        -u sk_test_xxx: \\
        -d type=card \\
        -d "card[number]=4242424242424242" \\
        -d "card[exp_month]=12" \\
        -d "card[exp_year]=2026" \\
        -d "card[cvc]=123"
    """
    result = await service.top_up_balance(current_user["sub"], dto)
    return result


# ── Картки ───────────────────────────────────────────────────────────────────

@router.post("/account/cards")
async def add_card(
    dto: AddCardRequest,
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
    """Прив'язати картку до акаунту."""
    card = await service.add_card(current_user["sub"], dto)
    return {"message": "Card added successfully", "last4": card.last4, "brand": card.brand}


# ── PIN ──────────────────────────────────────────────────────────────────────

@router.post("/account/pin")
async def set_pin(
    dto: SetPinRequest,
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
    """Встановити або оновити PIN."""
    success = await service.set_pin(current_user["sub"], dto)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to set PIN")
    return {"message": "PIN set successfully"}


@router.post("/account/pin/verify")
async def verify_pin(
    dto: VerifyPinRequest,
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
    """Перевірити PIN."""
    is_valid = await service.verify_pin(current_user["sub"], dto.pin)
    return {"valid": is_valid}


