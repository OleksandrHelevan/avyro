import { useNavigate } from "react-router-dom";
import { Calendar, Clock, ChevronRight, User } from "lucide-react";

interface AppointmentCardProps {
  appointment: any;
  doctor?: any;
}

const STATUS_STYLE: Record<string, { label: string; cls: string }> = {
  RESERVED:  { label: "Заплановано", cls: "ac-badge--blue" },
  FINISHED:  { label: "Завершено",   cls: "ac-badge--green" },
  CANCELLED: { label: "Скасовано",   cls: "ac-badge--red" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}

export default function AppointmentCard({ appointment: appt, doctor }: AppointmentCardProps) {
  const navigate = useNavigate();
  const id = appt._id || appt.id;
  const status = STATUS_STYLE[appt.status] || { label: appt.status, cls: "ac-badge--blue" };

  return (
    <button
      className="ac-card"
      onClick={() => navigate(`/appointments/${id}`)}
      aria-label={`Відкрити деталі запису`}
    >
      <div className="ac-left">
        <div className="ac-doctor-avatar">
          {doctor?.avatarUrl ? (
            <img src={doctor.avatarUrl} alt={doctor.fullName} />
          ) : (
            <User size={18} />
          )}
        </div>
        <div className="ac-info">
          <div className="ac-doctor-name">
            {doctor?.fullName || "Лікар"}
          </div>
          {doctor?.specializationName && (
            <div className="ac-spec">{doctor.specializationName}</div>
          )}
          <div className="ac-time-row">
            {appt.from && (
              <>
                <Calendar size={12} />
                <span>{formatDate(appt.from)}</span>
                <Clock size={12} />
                <span>{formatTime(appt.from)}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="ac-right">
        <span className={`ac-badge ${status.cls}`}>{status.label}</span>
        {appt.price != null && <span className="ac-price">{appt.price} ₴</span>}
        <ChevronRight size={16} className="ac-chevron" />
      </div>
    </button>
  );
}
