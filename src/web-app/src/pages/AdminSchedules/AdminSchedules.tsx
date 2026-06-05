import { CalendarDays, Check, X, Loader2, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useMemo, useState } from "react";

// Ваші стилі
import "./AdminSchedule.css";
import { useRejectSchedule } from "../../domains/admin/useRejectSchedule/useRejectSchedule.ts";
import { useAdminSchedules } from "../../domains/admin/useAdminSchedules/useAdminSchedules.ts";
import { useApproveSchedule } from "../../domains/admin/useApproveSchedule/useApproveSchedule.ts";
// Хук лікарів
import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors";

const ScheduleRequestCard = ({
                               schedule,
                               doctorEmail,
                               onApprove,
                               isApproving,
                               onReject,
                               isRejecting
                             }: any) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");

  const isBusy = isApproving || isRejecting;

  const data = schedule.payload || schedule;
  const month = data.month || "?";
  const year = data.year || "?";
  const startTime = data.repeating?.startTime || "?";
  const endTime = data.repeating?.endTime || "?";
  const slotDuration = data.repeating?.slotDuration || "?";

  const handleOpenRejectModal = () => {
    setRejectComment("");
    setIsModalOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectComment.trim() === "") {
      toast.error("Будь ласка, вкажіть причину відхилення!");
      return;
    }
    onReject({ scheduleId: schedule._id || schedule.id, comment: rejectComment.trim() });
    // Модалка закриється автоматично, коли запис зникне зі списку після успішного відхилення
  };

  return (
    <>
      <div className="dash-card">
        <div className="dash-header">
          <div>
            <h3 style={{
              wordBreak: 'break-all',
              color: doctorEmail.includes('Видалений') ? '#ef4444' : '#0f172a'
            }}>
              {doctorEmail}
            </h3>
            <span style={{ color: '#94a3b8' }}>Створення розкладу</span>
          </div>
          <CalendarDays size={24} color="#94a3b8" />
        </div>

        <div className="dash-metrics" style={{ flexDirection: 'column', gap: '10px', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Період:
            </span>
            <strong>{month}-й місяць, {year} рік</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Години роботи:</span>
            <strong>{startTime} — {endTime}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b' }}>Тривалість слота:</span>
            <strong>{slotDuration} хв</strong>
          </div>
        </div>

        <div className="dash-actions" style={{ display: 'flex', gap: '10px', padding: '0 1.5rem 1.5rem' }}>
          <button
            className="dash-btn"
            style={{
              background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0',
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', opacity: isBusy ? 0.7 : 1, cursor: isBusy ? 'not-allowed' : 'pointer'
            }}
            onClick={() => onApprove(schedule._id || schedule.id)}
            disabled={isBusy}
          >
            {isApproving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
            Прийняти
          </button>

          <button
            className="dash-btn"
            style={{
              background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca',
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', opacity: isBusy ? 0.7 : 1, cursor: isBusy ? 'not-allowed' : 'pointer'
            }}
            onClick={handleOpenRejectModal}
            disabled={isBusy}
          >
            {isRejecting ? <Loader2 className="animate-spin" size={18} /> : <X size={18} />}
            Відхилити
          </button>
        </div>
      </div>

      {/* ── ГАРНА МОДАЛКА ДЛЯ ВІДХИЛЕННЯ ── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '28px',
            width: '100%', maxWidth: '420px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative'
          }}>
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isRejecting}
              style={{
                position: 'absolute', top: '20px', right: '20px',
                background: 'transparent', border: 'none', color: '#94a3b8',
                cursor: 'pointer', padding: '4px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#fef2f2', padding: '10px', borderRadius: '12px', color: '#ef4444' }}>
                <AlertCircle size={24} />
              </div>
              <h3 style={{ margin: 0, fontSize: '20px', color: '#1e293b' }}>Відхилення графіка</h3>
            </div>

            <p style={{ color: '#64748b', fontSize: '14.5px', marginBottom: '20px', lineHeight: 1.5 }}>
              Будь ласка, вкажіть причину, через яку ви відхиляєте цей графік. Лікар побачить цей коментар і зможе внести правки.
            </p>

            <textarea
              autoFocus
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Наприклад: Змініть тривалість слота на 45 хвилин..."
              disabled={isRejecting}
              style={{
                width: '100%', minHeight: '110px', padding: '14px',
                borderRadius: '16px', border: '2px solid #e2e8f0',
                fontSize: '15px', color: '#1e293b', outline: 'none',
                resize: 'none', boxSizing: 'border-box', marginBottom: '24px',
                fontFamily: 'inherit', transition: 'border-color 0.2s',
                backgroundColor: isRejecting ? '#f8fafc' : 'white'
              }}
              onFocus={(e) => e.target.style.borderColor = '#7b51b3'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isRejecting}
                style={{
                  flex: 1, padding: '12px', borderRadius: '14px', border: 'none',
                  background: '#f1f5f9', color: '#475569', fontWeight: 600,
                  fontSize: '15px', cursor: isRejecting ? 'not-allowed' : 'pointer'
                }}
              >
                Скасувати
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={isRejecting}
                style={{
                  flex: 1, padding: '12px', borderRadius: '14px', border: 'none',
                  background: '#ef4444', color: 'white', fontWeight: 600,
                  fontSize: '15px', cursor: isRejecting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
                }}
              >
                {isRejecting ? <Loader2 size={18} className="animate-spin" /> : "Відхилити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function AdminSchedules() {
  const { data: schedules, isLoading: isSchedulesLoading, isError } = useAdminSchedules();
  const { data: rawDoctors, isLoading: isDocsLoading } = useGetDoctors();

  const { mutate: approveSchedule, isPending: isApproving } = useApproveSchedule();
  const { mutate: rejectSchedule, isPending: isRejecting } = useRejectSchedule();

  const doctorsList = useMemo(() => {
    if (Array.isArray(rawDoctors)) return rawDoctors;
    return (rawDoctors as any)?.data || (rawDoctors as any)?.items || [];
  }, [rawDoctors]);

  if (isSchedulesLoading || isDocsLoading) {
    return (
      <div className="dash-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}>
        <Loader2 className="animate-spin" size={40} color="#4f46e5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dash-page">
        <h2 style={{ color: '#ef4444' }}>Помилка завантаження розкладів</h2>
      </div>
    );
  }

  const pendingSchedules = schedules?.filter((s: any) => s.status === "PENDING") || [];

  return (
    <div className="dash-page">
      <h2>Запити на затвердження графіку ({pendingSchedules.length})</h2>

      {pendingSchedules.length === 0 ? (
        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Немає нових запитів на розклад.</p>
      ) : (
        <div className="dash-grid">
          {pendingSchedules.map((schedule: any) => {
            const payload = schedule.payload || {};
            const doctorId = schedule.doctorId || payload.doctorId || payload.doctor_id || schedule.creatorId || payload.creatorId;

            const doctor = doctorsList.find((d: any) => {
              const dId = d.id || d._id;
              return dId && doctorId && String(dId) === String(doctorId);
            });

            let displayEmail = "";
            if (doctor && doctor.email) {
              displayEmail = doctor.email;
            } else if (doctor && doctor.fullName) {
              displayEmail = doctor.fullName;
            } else if (doctorId) {
              displayEmail = `Видалений лікар (${doctorId.substring(0, 6)}...)`;
            } else {
              displayEmail = "Невідомий лікар";
            }

            return (
              <ScheduleRequestCard
                key={schedule._id || schedule.id}
                schedule={schedule}
                doctorEmail={displayEmail}
                onApprove={approveSchedule}
                isApproving={isApproving}
                onReject={rejectSchedule}
                isRejecting={isRejecting}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
