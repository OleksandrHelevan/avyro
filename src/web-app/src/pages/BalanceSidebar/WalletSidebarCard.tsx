import  { useState } from "react";

import "./WalletSidebarCard.css";
import {useCreatePaymentAccount} from "../../domains/payments/useCreatePaymentAccount/useCreatePaymentAccount.ts";
import {usePaymentAccount} from "../../domains/payments/usePaymentAccount/usePaymentAccount.ts";
import {CreditCard, Loader2, Plus, Wallet} from "lucide-react";
import TopUpModal from "../../components/WalletModal/TopUpModal.tsx";

export default function WalletSidebarCard() {
  const { data: account, isLoading, isError, error } = usePaymentAccount();
  const { mutate: createAccount, isPending: isCreating } = useCreatePaymentAccount();
  const [showTopUp, setShowTopUp] = useState(false);

  const accountNotFound =
    isError && (error?.message?.includes("404") || error?.message?.includes("not found"));

  if (isLoading) {
    return (
      <div className="wallet-card wallet-card--loading">
        <Loader2 size={16} className="spin" />
        <span>Завантаження...</span>
      </div>
    );
  }

  if (accountNotFound || !account) {
    return (
      <div className="wallet-card wallet-card--empty">
        <div className="wallet-card__icon">
          <Wallet size={20} />
        </div>
        <div className="wallet-card__info">
          <span className="wallet-card__label">Гаманець</span>
          <span className="wallet-card__sub">Не створено</span>
        </div>
        <button
          className="wallet-card__create-btn"
          onClick={() => createAccount()}
          disabled={isCreating}
        >
          {isCreating ? <Loader2 size={13} className="spin" /> : <Plus size={13} />}
          <span>{isCreating ? "Створення..." : "Створити"}</span>
        </button>
      </div>
    );
  }

  const balance = (account.balance / 100).toFixed(2); // assuming cents
  const currency = account.currency?.toUpperCase() || "UAH";
  const cardCount = account.paymentMethods?.length || 0;

  return (
    <>
      <div className="wallet-card wallet-card--active">
        <div className="wallet-card__top">
          <div className="wallet-card__icon wallet-card__icon--active">
            <Wallet size={18} />
          </div>
          <div className="wallet-card__info">
            <span className="wallet-card__label">Баланс</span>
            <span className="wallet-card__balance">
              {balance} <small>{currency}</small>
            </span>
          </div>
          <button
            className="wallet-card__topup-btn"
            onClick={() => setShowTopUp(true)}
            title="Поповнити баланс"
          >
            <Plus size={14} />
          </button>
        </div>

        {cardCount > 0 && (
          <div className="wallet-card__methods">
            <CreditCard size={12} />
            <span>{cardCount} {cardCount === 1 ? "картка" : "картки"}</span>
          </div>
        )}
      </div>

      <TopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />
    </>
  );
}
