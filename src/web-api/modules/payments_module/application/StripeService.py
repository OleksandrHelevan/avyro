import stripe
from config.db import STRIPE_SECRET_KEY
stripe.api_key = STRIPE_SECRET_KEY

class StripeService:


    async def create_customer(self, email: str, name: str) -> str:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"source": "web-api"},
        )
        return customer["id"]

    async def attach_payment_method(
        self, payment_method_id: str, customer_id: str
    ) -> dict:
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

        amount_cents = int(amount_uah * 100)
        intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="uah",
            customer=customer_id,
            payment_method=payment_method_id,
            confirm=True,
            automatic_payment_methods={"enabled": True, "allow_redirects": "never"},
        )
        return {
            "id": intent["id"],
            "status": intent["status"],
            "amount": amount_uah,
        }

    async def create_setup_intent(self, customer_id: str) -> str:

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
        await stripe.InvoiceItem.create_async(
            customer=customer_id,
            amount=int(amount * 100),
            currency="uah",
            description=description,
            metadata=metadata or {},
        )
        invoice = await stripe.Invoice.create_async(
            customer=customer_id,
            auto_advance=True,
            metadata=metadata or {},
        )
        finalized = await stripe.Invoice.finalize_invoice_async(invoice.id)
        return {
            "invoice_id": finalized.id,
            "status": finalized.status,
            "amount": amount,
            "hosted_invoice_url": finalized.hosted_invoice_url,
        }

        finalized = stripe.Invoice.finalize_invoice(invoice["id"])

        return {
            "invoice_id": finalized["id"],
            "status": finalized["status"],
            "amount": amount,
            "hosted_invoice_url": finalized.get("hosted_invoice_url"),
        }

    async def transfer_to_doctor(
        self,
        doctor_stripe_account_id: str,
        amount_uah: float,
        appointment_id: str,
    ) -> dict:
        transfer = await stripe.Transfer.create_async(
            amount=int(round(amount_uah * 100)),  # гривні → копійки для Stripe
            currency="uah",
            destination=doctor_stripe_account_id,
            metadata={"appointment_id": appointment_id},
        )
        return {"transfer_id": transfer.id, "amount": amount_uah}
