import bcrypt
from typing import Optional
from bson import ObjectId
from modules.payments_module.domains.Account import Account, CardInfo
from modules.payments_module.infrastructure.persistence.AccountRepository import AccountRepository
from modules.payments_module.application.StripeService import StripeService
from modules.payments_module.application.dto.PaymentDTOs import (
    TopUpBalanceRequest,
    AddCardRequest,
    SetPinRequest,
)

COMMISSION_RATE = 0.025  # 2.5%


class AccountService:
    def __init__(self, account_repo: AccountRepository, stripe_service: StripeService, reward_repository=None):
        self.account_repo = account_repo
        self.stripe_service = stripe_service
        self.reward_repository = reward_repository

    async def get_or_create_account(self, user_id: str, email: str, name: str) -> Account:
        oid = ObjectId(user_id)
        existing = self.account_repo.find_by_user_id(oid)
        if existing:
            return existing
        customer_id = await self.stripe_service.create_customer(email, name)
        account = Account(user_id=oid, stripe_customer_id=customer_id)
        return self.account_repo.create(account)

    async def top_up_balance(self, user_id: str, dto: TopUpBalanceRequest) -> dict:
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

        return {
            "stripe_payment_intent_id": result["id"],
            "status": result["status"],
            "message": "Payment requires additional action",
        }

    async def add_card(self, user_id: str, dto: AddCardRequest) -> CardInfo:
        oid = ObjectId(user_id)
        account = self.account_repo.find_by_user_id(oid)
        if not account:
            raise ValueError("Account not found")

        pm_data = await self.stripe_service.attach_payment_method(
            dto.payment_method_id, account.stripe_customer_id
        )
        card = CardInfo(**pm_data, is_default=dto.set_as_default)

        if dto.set_as_default:
            for c in account.cards:
                c.is_default = False

        self.account_repo.add_card(oid, card.model_dump())
        return card

    async def set_pin(self, user_id: str, dto: SetPinRequest) -> bool:
        hashed = bcrypt.hashpw(dto.pin.encode(), bcrypt.gensalt()).decode()
        return self.account_repo.set_pin(ObjectId(user_id), hashed)

    async def verify_pin(self, user_id: str, pin: str) -> bool:
        account = self.account_repo.find_by_user_id(ObjectId(user_id))
        if not account or not account.pin:
            return False
        return bcrypt.checkpw(pin.encode(), account.pin.encode())

    async def get_account(self, user_id: str) -> Account:
        account = self.account_repo.find_by_user_id(ObjectId(user_id))
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
        oid = ObjectId(patient_id)
        account = self.account_repo.find_by_user_id(oid)

        if not account:
            raise ValueError("Платіжний акаунт не знайдено. Створіть акаунт.")

        commission = round(amount * COMMISSION_RATE, 2)
        total_charged = round(amount + commission, 2)

        if account.balance < total_charged:
            raise ValueError(
                f"Недостатньо коштів. Баланс: {account.balance} грн, "
                f"потрібно: {total_charged} грн (включаючи комісію {commission} грн)"
            )

        try:
            invoice = await self.stripe_service.create_invoice(
                customer_id=account.stripe_customer_id,
                amount=total_charged,
                description=f"Візит до лікаря {doctor_name} (комісія {commission} грн)",
                metadata={
                    "appointment_id": appointment_id,
                    "patient_id": patient_id,
                    "commission": str(commission),
                },
            )
        except Exception as e:
            raise ValueError(f"Помилка створення інвойсу: {str(e)}")

        success = self.account_repo.deduct_balance(oid, total_charged)
        if not success:
            raise ValueError("Недостатньо коштів або помилка списання")

        return {
            "invoice_id": invoice["invoice_id"],
            "invoice_url": invoice["hosted_invoice_url"],
            "base_amount": amount,
            "commission": commission,
            "amount_paid": total_charged,
            "new_balance": round(account.balance - total_charged, 2),
        }

    async def pay_for_appointment_combined(
        self,
        patient_id: str,
        appointment_id: str,
        amount: float,
        doctor_name: str,
        points_available: int,  # залишається для сумісності, але більше не довіряємо
        payment_method: str = "MONEY",
        points_to_use: Optional[int] = None,
        money_to_use: Optional[float] = None,
    ) -> dict:
        oid = ObjectId(patient_id)
        account = self.account_repo.find_by_user_id(oid)
        if not account:
            raise ValueError("Платіжний акаунт не знайдено. Створіть акаунт.")

        # Завжди беремо реальний баланс балів з БД, ігноруємо points_available ззовні
        if self.reward_repository and payment_method in ("POINTS", "MIXED"):
            real_points_balance = self.reward_repository.get_total_points(oid)
        else:
            real_points_balance = points_available

        actual_points_used = 0
        actual_money_charged = 0.0

        if payment_method == "POINTS":
            if points_to_use is None:
                # Ділимо amount на 100, щоб порівнювати бали з балами
                actual_points_used = min(real_points_balance, int(amount / 100))
            else:
                actual_points_used = min(points_to_use, real_points_balance, int(amount / 100))

            # Множимо використані бали на 100 для перевірки з копійками
            if (actual_points_used * 100) < amount:
                raise ValueError(
                    f"Недостатньо балів. Є: {real_points_balance}, потрібно: {int(amount / 100)}"
                )
            actual_money_charged = 0.0

        elif payment_method == "MIXED":
            if points_to_use is None:
                actual_points_used = min(real_points_balance, int(amount / 100))
            else:
                actual_points_used = min(points_to_use, real_points_balance, int(amount / 100))

            # ВИПРАВЛЕНА МАТЕМАТИКА: Переводимо бали в копійки перед відніманням
            remaining_after_points = round(amount - (actual_points_used * 100), 2)

            if money_to_use is None:
                actual_money_charged = remaining_after_points
            else:
                actual_money_charged = min(money_to_use, remaining_after_points)

            # Перевіряємо, чи покриває мікс повну вартість (все в копійках)
            if round((actual_points_used * 100) + actual_money_charged, 2) < amount:
                raise ValueError(
                    f"Недостатньо коштів. Балів: {actual_points_used}, "
                    f"грошей: {actual_money_charged / 100} грн, потрібно покрити: {amount / 100} грн"
                )

            if account.balance < actual_money_charged:
                raise ValueError(
                    f"Недостатньо коштів на балансі. "
                    f"Є: {account.balance / 100} грн, потрібно: {actual_money_charged / 100} грн"
                )

        elif payment_method == "MONEY":
            if money_to_use is None:
                actual_money_charged = amount
            else:
                actual_money_charged = money_to_use
                if actual_money_charged < amount:
                    raise ValueError(
                        f"Вказана сума {actual_money_charged / 100} грн менша за вартість {amount / 100} грн"
                    )

            if account.balance < actual_money_charged:
                raise ValueError(
                    f"Недостатньо коштів. Баланс: {account.balance / 100} грн, "
                    f"потрібно: {actual_money_charged / 100} грн"
                )
            actual_points_used = 0

        else:
            raise ValueError(f"Невідомий метод оплати: {payment_method}")

        invoice_id = None
        invoice_url = None

        if actual_money_charged > 0:
            try:
                invoice = await self.stripe_service.create_invoice(
                    customer_id=account.stripe_customer_id,
                    amount=actual_money_charged,
                    description=f"Візит до лікаря {doctor_name}",
                    metadata={
                        "appointment_id": appointment_id,
                        "patient_id": patient_id,
                        "payment_method": payment_method,
                        "points_used": str(actual_points_used),
                    },
                )
                invoice_id = invoice["invoice_id"]
                invoice_url = invoice["hosted_invoice_url"]
            except Exception as e:
                raise ValueError(f"Помилка транзакції: {str(e)}")

            success = self.account_repo.deduct_balance(oid, actual_money_charged)
            if not success:
                raise ValueError("Помилка списання з балансу після успішної транзакції")

        return {
            "invoice_id": invoice_id,
            "invoice_url": invoice_url,
            "amount_paid": amount,
            "points_used": actual_points_used,
            "money_charged": actual_money_charged,
            "new_balance": account.balance - actual_money_charged,
            "payment_method": payment_method,
        }
