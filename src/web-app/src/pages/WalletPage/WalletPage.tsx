import { useState } from "react";
import {
  Wallet, CreditCard, ArrowUpCircle, RefreshCw,
  Loader2, Plus, ShieldCheck
} from "lucide-react";
import TopUpModal from "../../components/WalletModal/TopUpModal.tsx";

import "./WalletPage.css";
import {usePaymentAccount} from "../../domains/payments/usePaymentAccount/usePaymentAccount.ts";
import {useCreatePaymentAccount} from "../../domains/payments/useCreatePaymentAccount/useCreatePaymentAccount.ts";
import DoctorSidebar from "../../components/DoctorSidebar/DoctorSidebar.tsx";

export default function WalletPage() {
  const { data: account, isLoading, isError, error, refetch, isFetching } = usePaymentAccount();
  const { mutate: createAccount, isPending: isCreating } = useCreatePaymentAccount();
  const [showTopUp, setShowTopUp] = useState(false);

  const accountNotFound =
    isError && (error?.message?.includes("404") || error?.message?.includes("not found"));

  const balance = account ? (account.balance / 100).toFixed(2) : "0.00";
  const currency = account?.currency?.toUpperCase() || "UAH";


  return (
    <div className="aero-viewport light-theme" style={{ height: "calc(100vh - 70px)", overflow: "hidden" }}>
      <div className="main-content" style={{ height: "100%", position: "relative", zIndex: 1 }}>
        <div className="layout-container" style={{ height: "100%", display: "flex" }}>

          <DoctorSidebar />

          <main className="profile-content" style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>
            <div className="wallet-page__header">
              <div className="wallet-page__title">
                <Wallet size={22} />
                <div>
                  <h1>Мій Гаманець</h1>
                  <p>Керуйте балансом та платіжними методами</p>
                </div>
              </div>
              <button className="wallet-page__refresh" onClick={() => refetch()} disabled={isFetching} title="Оновити">
                <RefreshCw size={16} className={isFetching ? "spin" : ""} />
              </button>
            </div>

            {isLoading && (
              <div className="wallet-page__loading">
                <Loader2 size={32} className="spin" />
                <span>Завантаження гаманця...</span>
              </div>
            )}

            {!isLoading && (accountNotFound || !account) && (
              <div className="wallet-page__empty">
                <div className="wallet-empty-card">
                  <div className="wallet-empty-icon"><Wallet size={40} /></div>
                  <h2>Гаманець ще не створено</h2>
                  <p>Створіть гаманець, щоб поповнювати баланс та оплачувати послуги</p>
                  <div className="wallet-features">
                    <div className="wallet-feature"><ShieldCheck size={16} /><span>Безпечні платежі через Stripe</span></div>
                    <div className="wallet-feature"><CreditCard size={16} /><span>Visa, Mastercard, Apple Pay, Google Pay</span></div>
                  </div>
                  <button className="wallet-create-btn" onClick={() => createAccount()} disabled={isCreating}>
                    {isCreating ? <><Loader2 size={18} className="spin" /> Створення...</> : <><Plus size={18} /> Створити гаманець</>}
                  </button>
                </div>
              </div>
            )}

            {!isLoading && account && (
              <div className="wallet-page__content">
                <div className="balance-card">
                  <div className="balance-card__bg" />
                  <div className="balance-card__inner">

                    <div style={{ display: "flex", gap: "40px", alignItems: "flex-start", flexWrap: "wrap" }}>
                      <div>
                        <div className="balance-card__label">Поточний баланс</div>
                        <div className="balance-card__amount">
                          <span className="balance-big">{balance}</span>
                          <span className="balance-currency">{currency}</span>
                        </div>
                      </div>

                      <div>


                      </div>
                    </div>


                  </div>
                  <button className="balance-card__topup" onClick={() => setShowTopUp(true)}>
                    <ArrowUpCircle size={18} /> Поповнити
                  </button>
                </div>

                <div className="security-note">
                  <ShieldCheck size={16} />
                  <p>Ваші платіжні дані захищені шифруванням Stripe. Ми ніколи не зберігаємо реквізити ваших карток.</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <TopUpModal isOpen={showTopUp} onClose={() => setShowTopUp(false)} />
    </div>
  );
}
