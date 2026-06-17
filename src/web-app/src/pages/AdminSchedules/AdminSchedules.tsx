import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2, CalendarCheck, Calendar, Clock, AlertCircle, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

import { adminService } from "../../domains/admin/service/adminService.ts";
import type { AdminScheduleRequest } from "../../domains/admin/types.ts";
import "./AdminSchedule.css";

// Допоміжна функція для форматування днів
const getDaysNames = (daysArray?: number[]) => {
  if (!daysArray || !Array.isArray(daysArray)) return "—";
  const map: Record<number, string> = { 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб", 0: "Нд" };
  return daysArray.map(d => map[d]).filter(Boolean).join(", ");
};

const ScheduleRequestCard = ({
                               request,
                               onApprove,
                               isApproving,
                               onRejectClick,
                               isRejecting
                             }: {
  request: AdminScheduleRequest;
  onApprove: (id: string) => void;
  isApproving: boolean;
  onRejectClick: (id: string) => void;
  isRejecting: boolean;
}) => {
  const isBusy = isApproving || isRejecting;
  const payload = request.payload || (request as any).data || {};
  const repeating = payload.repeating || {};

  // Визначаємо тип заявки: якщо є scheduleId або type містить UPDATE — це оновлення
  const isUpdate = request.type?.toUpperCase().includes("UPDATE") || payload.scheduleId || (request as any).scheduleId;
  const typeLabel = isUpdate ? "Оновлення графіка" : "Новий графік";
  const typeColor = isUpdate ? "#3b82f6" : "#10b981"; // Синій для оновлень, зелений для нових
  const typeBg = isUpdate ? "#eff6ff" : "#ecfdf5";

  // Витягуємо ціну (шукаємо у всіх можливих полях) і ділимо на 100 (копійки -> гривні)
  const rawPrice = payload.pricePerSlot ?? payload.price ?? repeating.pricePerSlot ?? (request as any).pricePerSlot;
  const price = rawPrice ? rawPrice / 100 : null;

  const doctorName = (request as any).doctorName || (request as any).email || payload.doctorId || "Невідомий лікар";

  // Форматуємо дату створення заявки
  const createdDate = request.createdAt
    ? new Date(request.createdAt).toLocaleString("uk-UA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="req-card" style={{ borderTop: `4px solid ${typeColor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#0f172a" }}>{doctorName}</h3>
        <span style={{
          fontSize: "12px", fontWeight: "700", padding: "4px 8px", borderRadius: "8px",
          background: typeBg, color: typeColor
        }}>
          {typeLabel}
        </span>
      </div>

      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
        Надіслано: {createdDate}
      </div>

      <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
          <Calendar size={16} color="#7b51b3" />
          <span><strong>Період:</strong> {payload.month || "??"} / {payload.year || "??"}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
          <CalendarCheck size={16} color="#7b51b3" />
          <span><strong>Дні:</strong> {getDaysNames(repeating.daysOfWeek)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
          <Clock size={16} color="#7b51b3" />
          <span><strong>Години:</strong> {repeating.startTime || "—"} - {repeating.endTime || "—"} ({repeating.slotDuration} хв)</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569" }}>
          <CreditCard size={16} color="#7b51b3" />
          <span><strong>Вартість:</strong> {price ? `${price} ₴` : <span style={{color: "#ef4444"}}>Не вказано</span>}</span>
        </div>
      </div>

      <div className="req-actions">
        <button
          className="req-btn approve"
          onClick={() => onApprove(request._id || (request as any).id)}
          disabled={isBusy}
          style={{ opacity: isBusy ? 0.7 : 1 }}
        >
          {isApproving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
          Прийняти
        </button>

        <button
          className="req-btn reject"
          onClick={() => onRejectClick(request._id || (request as any).id)}
          disabled={isBusy}
          style={{ opacity: isBusy ? 0.7 : 1 }}
        >
          <X size={18} /> Відхилити
        </button>
      </div>
    </div>
  );
};

export default function AdminSchedules() {
  const queryClient = useQueryClient();

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["adminSchedules"],
    queryFn: () => adminService.getAdminSchedules(),
  });

  const { mutate: approveSchedule, isPending: isApproving } = useMutation({
    mutationFn: (id: string) => adminService.approveSchedule(id),
    onSuccess: () => {
      toast.success("Графік успішно затверджено!");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
    },
    onError: () => toast.error("Помилка при затвердженні"),
  });

  const { mutate: rejectSchedule, isPending: isRejecting } = useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) => adminService.rejectSchedule(id, comment),
    onSuccess: () => {
      toast.success("Графік відхилено.");
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setRejectModalId(null);
    },
    onError: () => toast.error("Помилка при відхиленні"),
  });

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
    if (rejectModalId) {
      rejectSchedule({ id: rejectModalId, comment: rejectComment.trim() });
    }
  };

  // Фільтруємо тільки ті, що очікують розгляду, і СОРТУЄМО за датою (найсвіжіші зверху)
  const sortedPendingRequests = useMemo(() => {
    if (!requests) return [];

    const pending = requests.filter(req => req.status === "PENDING" || req.status === "WAITING");

    return pending.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Сортування за спаданням
    });
  }, [requests]);

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

  return (
    <div className="req-page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>Заявки на розклад ({sortedPendingRequests.length})</h2>
      </div>

      {/* Модальне вікно відхилення */}
      {rejectModalId && (
        <div className="admin-modal-backdrop" onClick={!isRejecting ? handleCloseRejectModal : undefined}>
          <div className="admin-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                <AlertCircle color="#e11d48" size={22} />
                Відхилення графіка
              </h3>
              <button className="admin-close-btn" onClick={handleCloseRejectModal} disabled={isRejecting}>
                <X size={20} />
              </button>
            </div>
            <p className="admin-modal-text">Вкажіть причину відхилення. Лікар побачить цей коментар.</p>
            <div className="admin-textarea-wrapper">
              <textarea
                className="admin-textarea"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                placeholder="Наприклад: Вкажіть більшу тривалість прийому..."
                disabled={isRejecting}
              />
            </div>
            <div className="admin-modal-actions">
              <button className="btn-admin-cancel" onClick={handleCloseRejectModal} disabled={isRejecting}>Скасувати</button>
              <button className="btn-admin-confirm reject-confirm" onClick={handleConfirmReject} disabled={isRejecting || !rejectComment.trim()}>
                {isRejecting ? <><Loader2 size={18} className="animate-spin" /> Обробка...</> : "Відхилити графік"}
              </button>
            </div>
          </div>
        </div>
      )}

      {sortedPendingRequests.length === 0 ? (
        <p style={{textAlign: 'center', color: '#64748b', marginTop: '40px'}}>Немає нових заявок на розклад.</p>
      ) : (
        <div className="req-grid">
          {sortedPendingRequests.map(req => (
            <ScheduleRequestCard
              key={req._id || (req as any).id}
              request={req}
              onApprove={approveSchedule}
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
