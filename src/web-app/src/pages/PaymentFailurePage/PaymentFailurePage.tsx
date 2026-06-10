import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, RefreshCw, Wallet, ArrowLeft, Calendar, Clock, Coins, Info } from "lucide-react";
import "./PaymentFailurePage.css";

// ── State passed via navigate(state) or sessionStorage fallback ───────────

export interface PaymentFailureState {
  doctorId?: string;
  doctorName?: string;
  date?: string;
  amount?: number;
  reason?: "INSUFFICIENT_FUNDS" | "CARD_DECLINED" | "TIMEOUT" | "UNKNOWN";
  slotId?: string;
}

const REASON_LABELS: Record<string, string> = {
  INSUFFICIENT_FUNDS: "Недостатньо коштів на балансі",
  CARD_DECLINED:      "Картку відхилено банком",
  TIMEOUT:            "Час очікування вийшов",
  UNKNOWN:            "Невідома помилка",
};

export default function PaymentFailurePage() {
  const navigate = useNavigate();
  const location  = useLocation();

  // State can arrive via navigate("/payment-failure", { state: {...} })
  const state = (location.state as PaymentFailureState | null) || {};

  const {
    doctorId,
    doctorName = "Лікар",
    date,
    amount,
    reason = "UNKNOWN",
    slotId,
  } = state;

  const isInsufficientFunds = reason === "INSUFFICIENT_FUNDS";
  const reasonLabel = REASON_LABELS[reason] || REASON_LABELS.UNKNOWN;

  const handleRetry = () => {
    if (doctorId) {
      // 🚀 ВИПРАВЛЕНО: /doctor/ замість /doctors/
      navigate(`/doctor/${doctorId}`, { state: { prefillSlotId: slotId } });
    } else {
      navigate(-1);
    }
  };

  const handleTopUp = () => {
    // Pass return context so wallet page can show a banner
    navigate("/wallet?returnTo=booking", {
      state: { doctorId, doctorName, date, amount, slotId, reason },
    });
  };

  return (
    <div className="pf-page">
      {/* Icon */}
      <div className="pf-icon-ring">
        <CreditCard size={34} />
      </div>

      {/* Title */}
      <div className="pf-heading">
        <h1>Оплата не пройшла</h1>
        <p>На жаль, нам не вдалося провести платіж. Перевірте деталі та спробуйте ще раз.</p>
      </div>

      {/* Visit details card */}
      <div className="pf-detail-card">
        {doctorName && (
          <div className="pf-detail-row">
            <Calendar size={15} />
            <span><strong>Лікар</strong> — {doctorName}</span>
          </div>
        )}
        {date && (
          <div className="pf-detail-row">
            <Clock size={15} />
            <span><strong>Дата</strong> — {date}</span>
          </div>
        )}
        {amount != null && (
          <div className="pf-detail-row">
            <Coins size={15} />
            <span><strong>Сума</strong> — {amount} ₴</span>
          </div>
        )}
        <div className="pf-detail-row pf-detail-row--error">
          <Info size={15} />
          <span>{reasonLabel}</span>
        </div>
      </div>

      {/* Top-up banner (only for insufficient funds) */}
      {isInsufficientFunds && (
        <div className="pf-topup-banner">
          <Wallet size={18} className="pf-topup-icon" />
          <div className="pf-topup-text">
            <p>
              Для завершення запису поповніть гаманець
              {amount != null && <> на <strong>{amount} ₴</strong> або більше</>}.
            </p>
            <button className="pf-topup-btn" onClick={handleTopUp}>
              Поповнити баланс →
            </button>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pf-actions">
        <button className="pf-btn-retry" onClick={handleRetry}>
          <RefreshCw size={16} />
          Спробувати ще раз
        </button>
        <button className="pf-btn-ghost" onClick={() => navigate("/")}>
          <ArrowLeft size={14} />
          На головну
        </button>
      </div>
    </div>
  );
}
