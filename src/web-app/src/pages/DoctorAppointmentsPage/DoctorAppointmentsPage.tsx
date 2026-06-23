import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ChevronRight, CheckCircle2, Timer, XCircle, Stethoscope, CheckSquare, X, Loader2, FileText, AlertTriangle } from "lucide-react";
import Loader from "../../components/Loader/Loader.tsx";

import "./DoctorAppointmentsPage.css";
import { useGetDoctorAppointments } from "../../domains/users/useGetDoctorAppointments/useGetDoctorAppointments.ts";
import { useFinishAppointment } from "../../domains/appointments/useFinishAppointment/useFinishAppointment.ts";
import { useAddAppointmentNote } from "../../domains/appointments/useAddAppointmentNote/useAddAppointmentNote.ts";
// Імпортуємо хук скасування (як на сторінці пацієнта)
import { useCancelAppointment } from "../../domains/appointments/useCancelAppointment/useCancelAppointment.ts";

// ── Helpers ──
const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: any }> = {
  PLANNED:   { label: "Заплановано", className: "status--planned",  Icon: Timer },
  RESERVED:  { label: "Заплановано", className: "status--planned",  Icon: Timer },
  FINISHED:  { label: "Завершено",   className: "status--finished", Icon: CheckCircle2 },
  CANCELLED: { label: "Скасовано",   className: "status--cancelled", Icon: XCircle },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { weekday: "short", day: "numeric", month: "long" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}


function Avatar({ name, url, size = 48 }: { name?: string; url?: string; size?: number }) {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  if (url) return <img src={url} alt={name} className="dap-avatar-img" style={{ width: size, height: size }} />;
  return (
    <div className="dap-avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  );
}

export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"ALL" | "PLANNED" | "FINISHED" | "CANCELLED">("ALL");

  const [apptToFinish, setApptToFinish] = useState<string | null>(null);
  const [finishNote, setFinishNote] = useState("");

  const [apptToAddNote, setApptToAddNote] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  // Стейти для скасування запису лікарем
  const [apptToCancel, setApptToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const [currentTime, setCurrentTime] = useState(new Date().getTime());

  const { data: rawAppointments, isLoading, isError } = useGetDoctorAppointments();
  const { mutate: finishAppointment, isPending: isFinishing } = useFinishAppointment();
  const { mutate: addAppointmentNote, isPending: isAddingNote } = useAddAppointmentNote();
  // Мутація для скасування запису
  const { mutate: cancelAppointment, isPending: isCanceling } = useCancelAppointment();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().getTime()), 60000);
    return () => clearInterval(timer);
  }, []);

  const appointments = useMemo(() => {
    if (!rawAppointments) return [];
    const list = Array.isArray(rawAppointments) ? rawAppointments : (rawAppointments as any)?.items || [];

    return list.filter((appt: any) => {
      if (filter === "ALL") return true;
      if (filter === "PLANNED") return appt.status === "PLANNED" || appt.status === "RESERVED";
      return appt.status === filter;
    }).sort((a: any, b: any) => {
      const tA = new Date(a.from).getTime();
      const tB = new Date(b.from).getTime();

      if (filter === "FINISHED" || filter === "CANCELLED") {
        return tB - tA;
      }

      if (filter === "PLANNED") {
        return tA - tB;
      }

      const isFutureA = tA >= currentTime;
      const isFutureB = tB >= currentTime;

      if (isFutureA && !isFutureB) return -1;
      if (!isFutureA && isFutureB) return 1;

      if (isFutureA && isFutureB) {
        return tA - tB;
      } else {
        return tB - tA;
      }
    });
  }, [rawAppointments, filter, currentTime]);

  const handleFinishSubmit = () => {
    if (!apptToFinish) return;
    finishAppointment(
      { id: apptToFinish, note: finishNote },
      {
        onSuccess: () => {
          setApptToFinish(null);
          setFinishNote("");
        }
      }
    );
  };

  const handleNoteSubmit = () => {
    if (!apptToAddNote) return;
    addAppointmentNote(
      { id: apptToAddNote, note: noteText },
      {
        onSuccess: () => {
          setApptToAddNote(null);
          setNoteText("");
        }
      }
    );
  };

  // Хендлер підтвердження скасування
  const handleConfirmCancel = () => {
    if (!apptToCancel) return;
    cancelAppointment(
      { id: apptToCancel, reason: cancelReason },
      {
        onSuccess: () => {
          setApptToCancel(null);
          setCancelReason("");
        }
      }
    );
  };

  if (isLoading) return <div className="loading-screen"><Loader /></div>;

  if (isError) return (
    <div className="dap-error-state">
      <XCircle size={48} color="#ef4444" />
      <h2>Помилка завантаження</h2>
      <p>Не вдалося отримати ваші записи. Спробуйте пізніше.</p>
    </div>
  );

  return (
    <div className="dap-page">

      {/* Модалка завершення візиту */}
      {apptToFinish && (
        <div className="cancel-modal-backdrop" onClick={() => !isFinishing && setApptToFinish(null)}>
          <div className="cancel-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <h3 className="cancel-modal-title" style={{ color: "#0f172a" }}>
                <CheckSquare color="#10b981" size={22} strokeWidth={2.5} />
                Завершення візиту
              </h3>
              <button className="cancel-close-btn" onClick={() => setApptToFinish(null)} disabled={isFinishing}>
                <X size={20} />
              </button>
            </div>
            <p className="cancel-modal-text">
              Ви можете додати медичний висновок або нотатку про консультацію. Пацієнт зможе побачити цей коментар.
            </p>
            <div className="cancel-textarea-wrapper">
              <label className="cancel-textarea-label">Висновок / Нотатка (необов'язково)</label>
              <textarea
                className="cancel-textarea"
                value={finishNote}
                onChange={(e) => setFinishNote(e.target.value)}
                placeholder="Рекомендації, діагноз або підсумок прийому..."
                disabled={isFinishing}
                style={{ minHeight: "120px" }}
              />
            </div>
            <div className="cancel-modal-actions">
              <button className="btn-cancel-return" onClick={() => setApptToFinish(null)} disabled={isFinishing}>
                Назад
              </button>
              <button
                className="btn-cancel-confirm"
                onClick={handleFinishSubmit}
                disabled={isFinishing}
                style={{ background: "linear-gradient(135deg, #10b981, #059669)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
              >
                {isFinishing ? <><Loader2 size={18} className="spin" /> Обробка...</> : "Підтвердити завершення"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка додавання нотатки */}
      {apptToAddNote && (
        <div className="cancel-modal-backdrop" onClick={() => !isAddingNote && setApptToAddNote(null)}>
          <div className="cancel-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <h3 className="cancel-modal-title" style={{ color: "#0f172a" }}>
                <FileText color="#6366f1" size={22} strokeWidth={2.5} />
                Додати запис у картку
              </h3>
              <button className="cancel-close-btn" onClick={() => setApptToAddNote(null)} disabled={isAddingNote}>
                <X size={20} />
              </button>
            </div>
            <p className="cancel-modal-text">
              Додайте коментар до цього візиту. Це не завершить прийом, але збереже інформацію для історії.
            </p>
            <div className="cancel-textarea-wrapper">
              <label className="cancel-textarea-label">Текст нотатки</label>
              <textarea
                className="cancel-textarea"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Опишіть симптоми, скарги або проміжні результати..."
                disabled={isAddingNote}
                style={{ minHeight: "120px" }}
              />
            </div>
            <div className="cancel-modal-actions">
              <button className="btn-cancel-return" onClick={() => setApptToAddNote(null)} disabled={isAddingNote}>
                Скасувати
              </button>
              <button
                className="btn-cancel-confirm"
                onClick={handleNoteSubmit}
                disabled={isAddingNote || !noteText.trim()}
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}
              >
                {isAddingNote ? <><Loader2 size={18} className="spin" /> Збереження...</> : "Зберегти нотатку"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* НОВА: Модалка скасування візиту лікарем */}
      {apptToCancel && (
        <div className="cancel-modal-backdrop" onClick={() => !isCanceling && setApptToCancel(null)}>
          <div className="cancel-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="cancel-modal-header">
              <h3 className="cancel-modal-title" style={{ color: "#0f172a" }}>
                <AlertTriangle color="#ef4444" size={22} strokeWidth={2.5} />
                Скасування візиту лікарем
              </h3>
              <button className="cancel-close-btn" onClick={() => setApptToCancel(null)} disabled={isCanceling}>
                <X size={20} />
              </button>
            </div>
            <p className="cancel-modal-text">
              Ви впевнені, що хочете скасувати цей прийом? Пацієнт отримає сповіщення, а цей слот часу буде звільнено.
            </p>
            <div className="cancel-textarea-wrapper">
              <label className="cancel-textarea-label">Причина скасування (необов'язково)</label>
              <textarea
                className="cancel-textarea"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Вкажіть причину для пацієнта (наприклад: терміновий виклик, лікар на лікарняному)..."
                disabled={isCanceling}
                style={{ minHeight: "100px" }}
              />
            </div>
            <div className="cancel-modal-actions">
              <button className="btn-cancel-return" onClick={() => setApptToCancel(null)} disabled={isCanceling}>
                Повернутися
              </button>
              <button
                className="btn-cancel-confirm"
                onClick={handleConfirmCancel}
                disabled={isCanceling}
                style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)", boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)" }}
              >
                {isCanceling ? <><Loader2 size={18} className="spin" /> Скасування...</> : "Скасувати візит"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dap-container">
        <div className="dap-header">
          <div className="dap-header-title">
            <Stethoscope size={28} color="black" />
            <h1>Мої прийоми</h1>
          </div>
          <p className="dap-subtitle">Управління графіком та візитами пацієнтів</p>
        </div>

        <div className="dap-filters">
          {[
            { id: "ALL", label: "Всі" },
            { id: "PLANNED", label: "Заплановані" },
            { id: "FINISHED", label: "Завершені" },
            { id: "CANCELLED", label: "Скасовані" },
          ].map((f) => (
            <button
              key={f.id}
              className={`dap-filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id as any)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="dap-list">
          {appointments.length === 0 ? (
            <div className="dap-empty-state">
              <Calendar size={48} />
              <h3>Немає записів</h3>
              <p>За вибраними фільтрами візитів не знайдено.</p>
            </div>
          ) : (
            appointments.map((appt: any) => {
              const statusCfg = STATUS_CONFIG[appt.status] || { label: appt.status, className: "status--planned", Icon: Timer };
              const StatusIcon = statusCfg.Icon;
              const patientName = appt.patient?.fullName || appt.patient?.full_name || "Невідомий пацієнт";
              const patientUrl = appt.patient?.avatarUrl || appt.patient?.avatar_url;
              const isPlanned = appt.status === "PLANNED" || appt.status === "RESERVED";

              const fromMs = appt.from ? new Date(appt.from).getTime() : 0;
              const toMs = appt.to ? new Date(appt.to).getTime() : fromMs + 30 * 60000;
              const isCurrentNow = isPlanned && currentTime >= fromMs && currentTime <= toMs;

              const appointmentId = appt._id || appt.id;

              return (
                <div
                  key={appointmentId}
                  className={`dap-card ${isCurrentNow ? "dap-card--active-now" : ""}`}
                  onClick={() => navigate(`/appointments/${appointmentId}`)}
                >
                  <div className="dap-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className={`dap-badge ${statusCfg.className}`}>
                      <StatusIcon size={14} /> {statusCfg.label}
                    </div>

                    {isCurrentNow && (
                      <div className="dap-now-badge">
                        <span className="pulse-dot"></span> Йде зараз
                      </div>
                    )}
                  </div>

                  <div className="dap-card-middle">
                    <Avatar name={patientName} url={patientUrl} size={isCurrentNow ? 56 : 48} />
                    <div className="dap-patient-info">
                      <span className="dap-patient-label"><User size={12} /> Пацієнт</span>
                      <h4 style={{ fontSize: isCurrentNow ? '1.15rem' : '1.05rem' }}>{patientName}</h4>
                    </div>
                  </div>

                  <div className="dap-divider"></div>

                  <div className="dap-card-bottom">
                    <div className="dap-datetime">
                      <div className="dap-dt-item" style={{ color: isCurrentNow ? '#1e293b' : undefined, fontWeight: isCurrentNow ? 600 : undefined }}>
                        <Calendar size={16} /> {appt.from ? formatDate(appt.from) : "—"}
                      </div>
                      <div className="dap-dt-item" style={{ color: isCurrentNow ? '#3bceb5' : undefined, fontWeight: isCurrentNow ? 700 : undefined }}>
                        <Clock size={16} /> {appt.from ? formatTime(appt.from) : "—"}
                        {appt.to && ` - ${formatTime(appt.to)}`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className="dap-add-note-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setApptToAddNote(appointmentId);
                        }}
                      >
                        <FileText size={16} /> Нотатка
                      </button>

                      {isPlanned && (
                        <>
                          <button
                            className="dap-quick-finish-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setApptToFinish(appointmentId);
                            }}
                          >
                            <CheckSquare size={16} /> Завершити
                          </button>

                          {/* НОВА: Кнопка «Скасувати» для лікаря */}
                          <button
                            className="btn-cancel-return"
                            style={{
                              borderColor: '#ef4444',
                              color: '#ef4444',
                              padding: '6px 12px',
                              fontSize: '0.875rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setApptToCancel(appointmentId);
                            }}
                          >
                            <X size={16} /> Скасувати
                          </button>
                        </>
                      )}

                      <button className="dap-action-btn">
                        Деталі <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
