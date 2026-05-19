import { CalendarDays, Check, X, Loader2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { useMemo } from "react";

// Ваші стилі
import "./AdminSchedule.css";
import { useRejectSchedule } from "../../domains/admin/useRejectSchedule/useRejectSchedule.ts";
import { useAdminSchedules } from "../../domains/admin/useAdminSchedules/useAdminSchedules.ts";
import { useApproveSchedule } from "../../domains/admin/useApproveSchedule/useApproveSchedule.ts";
// Хук лікарів
import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors";

const ScheduleRequestCard = ({
                               schedule,
                               doctorEmail, // ТЕПЕР ТУТ EMAIL АБО ІМ'Я
                               onApprove,
                               isApproving,
                               onReject,
                               isRejecting
                             }: any) => {
  const isBusy = isApproving || isRejecting;

  const data = schedule.payload || schedule;
  const month = data.month || "?";
  const year = data.year || "?";
  const startTime = data.repeating?.startTime || "?";
  const endTime = data.repeating?.endTime || "?";
  const slotDuration = data.repeating?.slotDuration || "?";

  const handleRejectClick = () => {
    const comment = window.prompt("Вкажіть причину відхилення розкладу:");
    if (comment !== null) {
      if (comment.trim() === "") {
        toast.error("Причина є обов'язковою!");
        return;
      }
      onReject({ scheduleId: schedule._id || schedule.id, comment: comment.trim() });
    }
  };

  return (
    <div className="dash-card">
      <div className="dash-header">
        <div>
          {/* ВИВОДИМО EMAIL. Додали колір, щоб відрізняти помилки */}
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
          {isApproving ? <Loader2 className="animate-spin" size={18}/> : <Check size={18}/>}
          Прийняти
        </button>

        <button
          className="dash-btn"
          style={{
            background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca',
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '6px', opacity: isBusy ? 0.7 : 1, cursor: isBusy ? 'not-allowed' : 'pointer'
          }}
          onClick={handleRejectClick}
          disabled={isBusy}
        >
          {isRejecting ? <Loader2 className="animate-spin" size={18}/> : <X size={18}/>}
          Відхилити
        </button>
      </div>
    </div>
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
            // Дістаємо ID звідки тільки можливо
            const payload = schedule.payload || {};
            const doctorId = schedule.doctorId || payload.doctorId || payload.doctor_id || schedule.creatorId || payload.creatorId;

            // Шукаємо лікаря за ID
            const doctor = doctorsList.find((d: any) => {
              const dId = d.id || d._id;
              return dId && doctorId && String(dId) === String(doctorId);
            });

            // Формуємо текст для заголовка
            let displayEmail = "";
            if (doctor && doctor.email) {
              displayEmail = doctor.email;
            } else if (doctor && doctor.fullName) {
              displayEmail = doctor.fullName;
            } else if (doctorId) {
              // Якщо лікаря в базі немає, покажемо це явно!
              displayEmail = `Видалений лікар (${doctorId.substring(0, 6)}...)`;
            } else {
              displayEmail = "Невідомий лікар";
            }

            return (
              <ScheduleRequestCard
                key={schedule._id || schedule.id}
                schedule={schedule}
                doctorEmail={displayEmail} // Передаємо результат
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
