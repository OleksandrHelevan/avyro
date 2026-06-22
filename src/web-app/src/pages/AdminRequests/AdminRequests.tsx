import { useState } from "react";
import { UserCheck, UserX, UserCircle, Calendar, Loader2, X, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import "./AdminRequests.css";
import { useApproveRegistration } from "../../domains/admin/useApproveRegistration/useApproveRegistration.ts";
import { useAdminRegistrations } from "../../domains/admin/useAdminRegistrations/useAdminRegistrations.ts";
import { useRejectRegistration } from "../../domains/admin/useRejectRegistration/useRejectRegistration.ts";
import type { AdminRegistration } from "../../domains/admin/types.ts";

const RegistrationRequestCard = ({
                                   request,
                                   onApprove,
                                   isApproving,
                                   onRejectClick,
                                   isRejecting
                                 }: {
  request: AdminRegistration;
  onApprove: (id: string) => void;
  isApproving: boolean;
  onRejectClick: (id: string) => void;
  isRejecting: boolean;
}) => {
  const formattedDate = new Date(request.createdAt).toLocaleString("uk-UA", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  const isBusy = isApproving || isRejecting;

  return (
    <div className="req-card">
      <div className="req-avatar-placeholder"><UserCircle size={40} /></div>

      <h3>{request.payload.email}</h3>
      <div className="req-spec">Роль: {request.payload.role}</div>

      <div className="req-info">
        <p><span>Статус:</span> <strong style={{color: '#ca8a04'}}>{request.status}</strong></p>
        <p>
          <span>Створено:</span>
          <strong style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
            <Calendar size={14} /> {formattedDate}
          </strong>
        </p>
      </div>

      <div className="req-actions">
        <button
          className="req-btn approve"
          onClick={() => onApprove(request._id)}
          disabled={isBusy}
          style={{ opacity: isBusy ? 0.7 : 1 }}
        >
          {isApproving ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
          {isApproving ? "Обробка..." : "Прийняти"}
        </button>

        <button
          className="req-btn reject"
          onClick={() => onRejectClick(request._id)}
          disabled={isBusy}
          style={{ opacity: isBusy ? 0.7 : 1 }}
        >
          <UserX size={18} />
          Відхилити
        </button>
      </div>
    </div>
  );
};

export default function AdminRequests() {
  const { data: requests, isLoading, isError } = useAdminRegistrations();

  const { mutate: approveRegistration, isPending: isApproving } = useApproveRegistration();
  const { mutate: rejectRegistration, isPending: isRejecting } = useRejectRegistration();

  const [rejectModalId, setRejectModalId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  const handleOpenRejectModal = (id: string) => {
    setRejectModalId(id);
    setRejectComment("");
  };

  const handleCloseRejectModal = () => {
    setRejectModalId(null);
    setRejectComment("");
  };

  const handleConfirmReject = () => {
    if (!rejectComment.trim()) {
      toast.error("Причина відхилення обов'язкова!");
      return;
    }
    if (!rejectModalId) return;

    rejectRegistration(
      { requestId: rejectModalId, comment: rejectComment.trim() },
      {
        onSuccess: () => {
          handleCloseRejectModal();
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="req-page" style={{display: 'flex', justifyContent: 'center', marginTop: '100px'}}>
        <Loader2 className="animate-spin" size={40} color="#4f46e5" />
      </div>
    );
  }

  if (isError) {
    return <div className="req-page"><h2>Помилка завантаження запитів.</h2></div>;
  }

  const pendingRequests = requests?.filter(req => req.status === "PENDING") || [];

  return (
    <div className="req-page">
      <h2>Нові заявки на реєстрацію ({pendingRequests.length})</h2>

      {rejectModalId && (
        <div className="admin-modal-backdrop" onClick={!isRejecting ? handleCloseRejectModal : undefined}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <AlertCircle color="#e11d48" size={22} />
                Відхилення заявки
              </h3>
              <button className="admin-close-btn" onClick={handleCloseRejectModal} disabled={isRejecting}>
                <X size={20} />
              </button>
            </div>

            <p className="admin-modal-text">
              Будь ласка, вкажіть причину відхилення. Користувач побачить цей коментар.
            </p>

            <div className="admin-textarea-wrapper">
              <textarea
                className="admin-textarea"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Наприклад: Недостатньо документів, підозріла активність..."
                disabled={isRejecting}
              />
            </div>

            <div className="admin-modal-actions">
              <button className="btn-admin-cancel" onClick={handleCloseRejectModal} disabled={isRejecting}>
                Скасувати
              </button>
              <button
                className="btn-admin-confirm reject-confirm"
                onClick={handleConfirmReject}
                disabled={isRejecting || !rejectComment.trim()}
              >
                {isRejecting ? <><Loader2 size={18} className="animate-spin" /> Обробка...</> : "Підтвердити відхилення"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingRequests.length === 0 ? (
        <p style={{textAlign: 'center', color: '#000000'}}>Немає нових заявок.</p>
      ) : (
        <div className="req-grid">
          {pendingRequests.map(req => (
            <RegistrationRequestCard
              key={req._id}
              request={req}
              onApprove={approveRegistration}
              isApproving={isApproving}
              onRejectClick={handleOpenRejectModal}
              isRejecting={isRejecting}
            />
          ))}
        </div>
      )}
    </div>
  );
}
