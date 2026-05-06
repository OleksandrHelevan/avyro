import { UserCheck, UserX, UserCircle, Calendar, Loader2 } from "lucide-react";
import toast from "react-hot-toast"; // Додано для сповіщень
import type { AdminRegistration } from "../../domains/users/types";
import "./AdminRequests.css";
import {useApproveRegistration} from "../../domains/users/useApproveRegistration/useApproveRegistration.ts";
import {useAdminRegistrations} from "../../domains/users/useAdminRegistrations/useAdminRegistrations.ts";
import {useRejectRegistration} from "../../domains/users/useRejectRegistration/useRejectRegistration.ts";

const RegistrationRequestCard = ({
                                   request,
                                   onApprove,
                                   isApproving,
                                   onReject,       // ДОДАНО
                                   isRejecting     // ДОДАНО
                                 }: {
  request: AdminRegistration;
  onApprove: (id: string) => void;
  isApproving: boolean;
  onReject: (data: { requestId: string; comment: string }) => void; // ДОДАНО
  isRejecting: boolean; // ДОДАНО
}) => {
  const formattedDate = new Date(request.createdAt).toLocaleString("uk-UA", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });

  // Функція обробки кліку "Відхилити"
  const handleRejectClick = () => {
    const comment = window.prompt("Введіть причину відхилення (обов'язково):");
    if (comment !== null) { // Якщо користувач не натиснув "Скасувати"
      if (comment.trim() === "") {
        toast.error("Причина відхилення обов'язкова!");
        return;
      }
      onReject({ requestId: request._id, comment: comment.trim() });
    }
  };

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
        {/* КНОПКА ПІДТВЕРДЖЕННЯ */}
        <button
          className="req-btn approve"
          onClick={() => onApprove(request._id)}
          disabled={isBusy}
          style={{ opacity: isBusy ? 0.7 : 1 }}
        >
          {isApproving ? <Loader2 className="animate-spin" size={18} /> : <UserCheck size={18} />}
          {isApproving ? "Обробка..." : "Прийняти"}
        </button>

        {/* КНОПКА ВІДХИЛЕННЯ */}
        <button
          className="req-btn reject"
          onClick={handleRejectClick}
          disabled={isBusy}
          style={{ opacity: isBusy ? 0.7 : 1 }}
        >
          {isRejecting ? <Loader2 className="animate-spin" size={18} /> : <UserX size={18} />}
          {isRejecting ? "Обробка..." : "Відхилити"}
        </button>
      </div>
    </div>
  );
};

export default function AdminRequests() {
  const { data: requests, isLoading, isError } = useAdminRegistrations();

  const { mutate: approveRegistration, isPending: isApproving } = useApproveRegistration();
  // Витягуємо мутацію для відхилення
  const { mutate: rejectRegistration, isPending: isRejecting } = useRejectRegistration();

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

      {pendingRequests.length === 0 ? (
        <p style={{textAlign: 'center', color: '#64748b'}}>Немає нових заявок.</p>
      ) : (
        <div className="req-grid">
          {pendingRequests.map(req => (
            <RegistrationRequestCard
              key={req._id}
              request={req}
              onApprove={approveRegistration}
              isApproving={isApproving}
              onReject={rejectRegistration}  // Передаємо функцію
              isRejecting={isRejecting}      // Передаємо стан
            />
          ))}
        </div>
      )}
    </div>
  );
}
