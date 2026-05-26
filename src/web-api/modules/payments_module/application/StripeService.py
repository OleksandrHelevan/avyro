import stripe
from config.db import STRIPE_SECRET_KEY
stripe.api_key = STRIPE_SECRET_KEY

class StripeService:
    """
    Тестовий режим Stripe.
    Ніякої реальної оплати — використовуємо тестові картки Stripe:
      - 4242 4242 4242 4242 — успішний платіж
      - 4000 0000 0000 0002 — відхилений платіж
    """

    async def create_customer(self, email: str, name: str) -> str:
        """Створити Stripe Customer — повертає customer_id (cus_xxxx)"""
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"source": "web-api"},
        )
        return customer["id"]

    async def attach_payment_method(
        self, payment_method_id: str, customer_id: str
    ) -> dict:
        """Прив'язати картку до Customer"""
        pm = stripe.PaymentMethod.attach(
            payment_method_id,
            customer=customer_id,
        )
        return {
            "stripe_payment_method_id": pm["id"],
            "last4": pm["card"]["last4"],
            "brand": pm["card"]["brand"],
            "exp_month": pm["card"]["exp_month"],
            "exp_year": pm["card"]["exp_year"],
        }

    async def create_payment_intent(
        self,
        amount_uah: float,
        customer_id: str,
        payment_method_id: str,
    ) -> dict:
        """
        Створити і одразу підтвердити PaymentIntent для поповнення балансу.
        amount_uah — сума в гривнях, конвертуємо в копійки (Stripe приймає найменшу одиницю).
        """
        amount_cents = int(amount_uah * 100)
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="uah",           # змінити на "usd" якщо потрібно
            customer=customer_id,
            payment_method=payment_method_id,
            confirm=True,             # одразу підтвердити
            automatic_payment_methods={"enabled": True, "allow_redirects": "never"},
        )
        return {
            "id": intent["id"],
            "status": intent["status"],   # "succeeded" | "requires_action" | etc
            "amount": amount_uah,
        }

    async def create_setup_intent(self, customer_id: str) -> str:
        """
        Створити SetupIntent для безпечного зберігання картки без оплати.
        Повертає client_secret для Stripe.js на фронті.
        """
        intent = stripe.SetupIntent.create(
            customer=customer_id,
            payment_method_types=["card"],
        )
        return intent["client_secret"]

    async def create_invoice(
        self,
        customer_id: str,
        amount: float,
        description: str,
        metadata: dict = None,
    ) -> dict:
        """
        Створити Invoice в Stripe — фіксований чек оплати.
        Повертає invoice_id і статус.
        """
        # 1. Створюємо invoice item
        stripe.InvoiceItem.create(
            customer=customer_id,
            amount=int(amount * 100),  # в копійках
            currency="uah",
            description=description,
            metadata=metadata or {},
        )

        # 2. Створюємо і одразу фіналізуємо invoice
        invoice = stripe.Invoice.create(
            customer=customer_id,
            auto_advance=True,  # автоматично фіналізує
            metadata=metadata or {},
        )

        finalized = stripe.Invoice.finalize_invoice(invoice["id"])

        return {
            "invoice_id": finalized["id"],
            "status": finalized["status"],
            "amount": amount,
            "hosted_invoice_url": finalized.get("hosted_invoice_url"),
        }
