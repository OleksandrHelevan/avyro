import React, { useState } from "react";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import { X, Wallet, Loader2, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import "./TopUpModal.css";
import { PAYMENT_ACCOUNT_QUERY_KEY } from "../../domains/payments/usePaymentAccount/usePaymentAccount.ts";
import { useTopUpBalance } from "../../domains/payments/useTopUpBalance/useTopUpBalance.ts";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface CheckoutFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, onSuccess, onCancel }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const queryClient = useQueryClient();
  const { mutate: initiateTopUp } = useTopUpBalance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setIsProcessing(false);
      return;
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });

    if (error) {
      toast.error(error.message || "Помилка перевірки картки");
      setIsProcessing(false);
      return;
    }

    initiateTopUp(
      {
        amount: amount * 100,
        payment_method_id: paymentMethod.id
      },
      {
        onSuccess: () => {
          setSucceeded(true);
          toast.success(`Баланс поповнено на ${amount} ₴`);
          queryClient.invalidateQueries({ queryKey: PAYMENT_ACCOUNT_QUERY_KEY });
          setTimeout(onSuccess, 1500);
        },
        onError: (err) => {
          toast.error(err.message || "Помилка при поповненні");
          setIsProcessing(false);
        },
      }
    );
  };

  if (succeeded) {
    return (
      <div className="topup-success">
        <CheckCircle2 size={56} className="success-icon" />
        <h3>Успішно!</h3>
        <p>Ваш баланс поповнено на <strong>{amount} ₴</strong></p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="topup-form">
      <div className="amount-display">
        <span className="amount-label">Сума поповнення</span>
        <span className="amount-value">{amount} ₴</span>
      </div>

      <div className="stripe-element-wrapper" style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#fff" }}>
        <CardElement
          options={{
            hidePostalCode: true, // 🚀 ЗМІНА 2: Вимикаємо поле ZIP Code, щоб уникнути помилки "incomplete_zip"
            style: {
              base: {
                fontSize: "16px",
                color: "#1e293b",
                fontFamily: "inherit",
                "::placeholder": {
                  color: "#94a3b8",
                },
              },
            },
          }}
        />
      </div>

      <div className="topup-hint">
        <p>🧪 Тестові картки: <code>4242 4242...</code> — успішно · <code>4000 0000...0002</code> — відхилено</p>
      </div>

      <div className="topup-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={isProcessing}>
          Скасувати
        </button>
        <button type="submit" className="btn-pay" disabled={isProcessing || !stripe}>
          {isProcessing ? (
            <><Loader2 size={16} className="spin" /> Обробка...</>
          ) : (
            <>Поповнити {amount} ₴</>
          )}
        </button>
      </div>
    </form>
  );
}



interface AmountStepProps {
  onConfirm: (amount: number) => void;
  onCancel: () => void;
}

const PRESET_AMOUNTS = [100, 200, 500, 1000];

function AmountStep({ onConfirm, onCancel }: AmountStepProps) {
  const [amount, setAmount] = useState<string>("200");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(amount, 10);
    if (!num || num < 10) {
      toast.error("Мінімальна сума: 10 ₴");
      return;
    }
    onConfirm(num);
  };

  return (
    <form onSubmit={handleSubmit} className="amount-step">
      <p className="step-subtitle">Оберіть або введіть суму поповнення</p>

      <div className="preset-amounts">
        {PRESET_AMOUNTS.map((p) => (
          <button
            key={p}
            type="button"
            className={`preset-btn ${amount === String(p) ? "active" : ""}`}
            onClick={() => setAmount(String(p))}
          >
            {p} ₴
          </button>
        ))}
      </div>

      <div className="custom-amount-wrapper">
        <span className="currency-prefix">₴</span>
        <input
          type="number"
          min={10}
          max={50000}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Інша сума..."
          className="amount-input"
        />
      </div>

      <div className="topup-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Скасувати
        </button>
        <button type="submit" className="btn-pay">
          Далі →
        </button>
      </div>
    </form>
  );
}


interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const [step, setStep] = useState<"amount" | "payment">("amount");
  const [selectedAmount, setSelectedAmount] = useState<number>(0);

  const handleAmountConfirm = (amount: number) => {
    setSelectedAmount(amount);
    setStep("payment");
  };

  const handleClose = () => {
    setStep("amount");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div className="modal-title">
            <Wallet size={20} />
            <span>Поповнення балансу</span>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {step === "amount" && (
            <AmountStep
              onConfirm={handleAmountConfirm}
              onCancel={handleClose}
            />
          )}

          {step === "payment" && (
            <Elements stripe={stripePromise}>
              <CheckoutForm
                amount={selectedAmount}
                onSuccess={handleClose}
                onCancel={handleClose}
              />
            </Elements>
          )}
        </div>
      </div>
    </div>
  );
}
