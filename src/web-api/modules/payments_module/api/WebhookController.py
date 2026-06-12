
import stripe
from fastapi import APIRouter, Request, HTTPException
from config.db import STRIPE_WEBHOOK_SECRET

router = APIRouter(prefix="/payments", tags=["payments-webhook"])


@router.post("/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "payment_intent.succeeded":
        intent = event["data"]["object"]
        print(f"[Stripe] PaymentIntent succeeded: {intent['id']}, amount: {intent['amount']}")

    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        print(f"[Stripe] PaymentIntent failed: {intent['id']}")

    elif event["type"] == "customer.created":
        customer = event["data"]["object"]
        print(f"[Stripe] Customer created: {customer['id']}")

    return {"status": "ok"}
