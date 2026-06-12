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

@router.post("/account", status_code=status.HTTP_201_CREATED)
async def create_account(
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
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
    account = await service.get_or_create_account(
        user_id=current_user["sub"],
        email=current_user.get("email", ""),
        name=current_user.get("name", ""),
    )
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


@router.post("/account/top-up")
async def top_up_balance(
    dto: TopUpBalanceRequest,
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):

    result = await service.top_up_balance(current_user["sub"], dto)
    return result



@router.post("/account/cards")
async def add_card(
    dto: AddCardRequest,
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
    card = await service.add_card(current_user["sub"], dto)
    return {"message": "Card added successfully", "last4": card.last4, "brand": card.brand}



@router.post("/account/pin")
async def set_pin(
    dto: SetPinRequest,
    current_user: dict = Depends(get_current_user),
    service: AccountService = Depends(get_account_service),
):
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
    is_valid = await service.verify_pin(current_user["sub"], dto.pin)
    return {"valid": is_valid}


