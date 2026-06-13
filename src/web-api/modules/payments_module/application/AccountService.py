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

COMMISSION_RATE = 0.025  # 2.5%


class AccountService:
    def __init__(self, account_repo: AccountRepository, stripe_service: StripeService):
        self.account_repo = account_repo
        self.stripe_service = stripe_service

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
        points_available: float,
        payment_method: str = "MONEY",
        doctor_stripe_account_id: str = None,  # Stripe Connect акаунт лікаря
    ) -> dict:
        oid = ObjectId(patient_id)
        account = self.account_repo.find_by_user_id(oid)
        if not account:
            raise ValueError("Платіжний акаунт не знайдено. Створіть акаунт.")

        commission = round(amount * COMMISSION_RATE, 2)
        doctor_receives = amount  # лікар отримує суму без комісії

        points_to_use = 0
        money_to_charge = 0.0

        if payment_method == "POINTS":
            # Бали покривають вартість слоту, але комісію платить грошима
            if points_available < amount:
                raise ValueError(
                    f"Недостатньо балів. Є: {points_available}, потрібно: {int(amount)}"
                )
            if account.balance < commission:
                raise ValueError(
                    f"Недостатньо коштів для оплати комісії ({commission} грн). "
                    f"Баланс: {account.balance} грн"
                )
            points_to_use = int(amount)
            money_to_charge = commission  # тільки комісія

        elif payment_method == "MIXED":
            points_to_use = min(int(points_available), int(amount))
            money_to_charge = round(amount - points_to_use + commission, 2)
            if account.balance < money_to_charge:
                raise ValueError(
                    f"Недостатньо коштів. Баланс: {account.balance} грн + "
                    f"{points_available} балів, потрібно: {round(amount + commission, 2)} грн"
                )

        elif payment_method == "MONEY":
            total_charged = round(amount + commission, 2)
            if account.balance < total_charged:
                raise ValueError(
                    f"Недостатньо коштів. Баланс: {account.balance} грн, "
                    f"потрібно: {total_charged} грн (комісія {commission} грн)"
                )
            money_to_charge = total_charged
            points_to_use = 0

        else:
            raise ValueError(f"Невідомий метод оплати: {payment_method}")

        invoice_id = None
        invoice_url = None

        # 1. Stripe інвойс — якщо впаде, нічого не списуємо
        if money_to_charge > 0:
            try:
                invoice = await self.stripe_service.create_invoice(
                    customer_id=account.stripe_customer_id,
                    amount=money_to_charge,
                    description=f"Візит до лікаря {doctor_name} (комісія {commission} грн)",
                    metadata={
                        "appointment_id": appointment_id,
                        "patient_id": patient_id,
                        "payment_method": payment_method,
                        "points_used": str(points_to_use),
                        "commission": str(commission),
                    },
                )
                invoice_id = invoice["invoice_id"]
                invoice_url = invoice["hosted_invoice_url"]
            except Exception as e:
                raise ValueError(f"Помилка транзакції: {str(e)}")

            # 2. Stripe успішний — списуємо з балансу
            success = self.account_repo.deduct_balance(oid, money_to_charge)
            if not success:
                raise ValueError("Помилка списання з балансу після успішної транзакції")

        # 3. Переказуємо лікарю через Stripe Connect
        transfer_id = None
        if doctor_stripe_account_id and doctor_receives > 0:
            try:
                transfer = await self.stripe_service.transfer_to_doctor(
                    doctor_stripe_account_id=doctor_stripe_account_id,
                    amount_uah=doctor_receives,
                    appointment_id=appointment_id,
                )
                transfer_id = transfer["transfer_id"]
            except Exception as e:
                print(f"WARNING: Не вдалось перерахувати лікарю {doctor_name}: {e}")

        return {
            "invoice_id": invoice_id,
            "invoice_url": invoice_url,
            "base_amount": amount,
            "commission": commission,
            "amount_paid": round(money_to_charge + (points_to_use if payment_method != "MONEY" else 0), 2),
            "doctor_receives": doctor_receives,
            "points_used": points_to_use,
            "money_charged": money_to_charge,
            "new_balance": round(account.balance - money_to_charge, 2),
            "payment_method": payment_method,
            "transfer_id": transfer_id,
        }
