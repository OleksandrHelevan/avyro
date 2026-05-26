import bcrypt
from bson import ObjectId
from modules.payments_module.domains.Account import Account, CardInfo
from modules.payments_module.infrastructure.persistence.AccountRepository import AccountRepository
from modules.payments_module.application.StripeService import StripeService
from modules.payments_module.application.dto.PaymentDTOs import (
    TopUpBalanceRequest,
    AddCardRequest,
    SetPinRequest,
)


class AccountService:
    def __init__(self, account_repo: AccountRepository, stripe_service: StripeService):
        self.account_repo = account_repo
        self.stripe_service = stripe_service

    async def get_or_create_account(
        self, user_id: str, email: str, name: str
    ) -> Account:
        """Якщо акаунт ще не існує — створюємо Stripe Customer і зберігаємо."""
        oid = ObjectId(user_id)
        existing = self.account_repo.find_by_user_id(oid)
        if existing:
            return existing

        customer_id = await self.stripe_service.create_customer(email, name)
        account = Account(user_id=oid, stripe_customer_id=customer_id)
        return self.account_repo.create(account)

    async def top_up_balance(
        self, user_id: str, dto: TopUpBalanceRequest
    ) -> dict:
        """
        Поповнення балансу:
        1. Робимо PaymentIntent через Stripe (тестовий режим)
        2. Якщо succeeded — додаємо суму до балансу в БД
        """
        oid = ObjectId(user_id)
        account = self.account_repo.find_by_user_id(oid)
        if not account:
            raise ValueError("Account not found. Create account first.")

        result = await self.stripe_service.create_payment_intent(
            amount_uah=dto.amount,
            customer_id=account.stripe_customer_id,
            payment_method_id=dto.payment_method_id,
        )

        if result["status"] == "succeeded":
            new_balance = account.balance + dto.amount
            self.account_repo.update_balance(oid, new_balance)
            return {
                "stripe_payment_intent_id": result["id"],
                "status": "succeeded",
                "amount_added": dto.amount,
                "new_balance": new_balance,
            }

        # Платіж не пройшов одразу (напр. requires_action)
        return {
            "stripe_payment_intent_id": result["id"],
            "status": result["status"],
            "message": "Payment requires additional action",
        }

    async def add_card(self, user_id: str, dto: AddCardRequest) -> CardInfo:
        """Прив'язати нову картку до акаунту через Stripe."""
        oid = ObjectId(user_id)
        account =  self.account_repo.find_by_user_id(oid)
        if not account:
            raise ValueError("Account not found")

        pm_data = await self.stripe_service.attach_payment_method(
            dto.payment_method_id, account.stripe_customer_id
        )

        card = CardInfo(**pm_data, is_default=dto.set_as_default)

        # Якщо встановлюємо дефолтну — скинути is_default у інших
        if dto.set_as_default:
            for c in account.cards:
                c.is_default = False

        self.account_repo.add_card(oid, card.model_dump())
        return card

    async def set_pin(self, user_id: str, dto: SetPinRequest) -> bool:
        """Встановити/оновити PIN (зберігаємо bcrypt hash)."""
        hashed = bcrypt.hashpw(dto.pin.encode(), bcrypt.gensalt()).decode()
        return  self.account_repo.set_pin(ObjectId(user_id), hashed)

    async def verify_pin(self, user_id: str, pin: str) -> bool:
        """Перевірити PIN."""
        account =  self.account_repo.find_by_user_id(ObjectId(user_id))
        if not account or not account.pin:
            return False
        return bcrypt.checkpw(pin.encode(), account.pin.encode())

    async def get_account(self, user_id: str) -> Account:
        account =  self.account_repo.find_by_user_id(ObjectId(user_id))
        if not account:
            raise ValueError("Account not found")
        return account

async def pay_for_appointment(
    self,
    patient_id: str,
    appointment_id: str,
    amount: float,
    doctor_name: str,
) -> dict:
    """
    Оплата візиту:
    1. Перевіряємо баланс
    2. Створюємо Invoice в Stripe
    3. Списуємо з балансу
    Якщо будь-який крок падає — rollback
    """
    oid = ObjectId(patient_id)
    account = self.account_repo.find_by_user_id(oid)

    if not account:
        raise ValueError("Платіжний акаунт не знайдено. Створіть акаунт.")

    if account.balance < amount:
        raise ValueError(
            f"Недостатньо коштів. Баланс: {account.balance}, потрібно: {amount}"
        )

    # Створюємо Invoice в Stripe (фіксуємо чек)
    try:
        invoice = await self.stripe_service.create_invoice(
            customer_id=account.stripe_customer_id,
            amount=amount,
            description=f"Візит до лікаря {doctor_name}",
            metadata={
                "appointment_id": appointment_id,
                "patient_id": patient_id,
            },
        )
    except Exception as e:
        raise ValueError(f"Помилка створення інвойсу: {str(e)}")

    # Атомарно списуємо з балансу
    success = self.account_repo.deduct_balance(oid, amount)
    if not success:
        raise ValueError("Недостатньо коштів або помилка списання")

    return {
        "invoice_id": invoice["invoice_id"],
        "invoice_url": invoice["hosted_invoice_url"],
        "amount_paid": amount,
        "new_balance": account.balance - amount,
    }
