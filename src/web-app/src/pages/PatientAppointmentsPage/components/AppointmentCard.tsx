import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import { CalendarDays, Clock, CheckCircle2, Clock3, ExternalLink, XCircle } from "lucide-react"; // 🚀 ДОДАНО XCircle
import { useNavigate } from "react-router-dom";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Doctor&background=E0E7FF&color=4F46E5&size=128";

export interface DoctorInfo {
  id?: string;
  _id?: string;
  fullName?: string;
  avatarUrl?: string;
  specializationName?: string;
  specializationId?: string;
}

export interface AppointmentInfo {
  id?: string;
  _id?: string;
  doctorId?: string;
  from?: string;
  to?: string;
  status?: string;
}

interface AppointmentCardProps {
  appointment: AppointmentInfo;
  doctor?: DoctorInfo;
  onCancel?: (appt: AppointmentInfo) => void; // 🚀 ДОДАНО
}

export default function AppointmentCard({ appointment, doctor, onCancel }: AppointmentCardProps) {
  const navigate = useNavigate();

  const startDate = appointment.from ? parseISO(appointment.from) : new Date();
  const endDate = appointment.to ? parseISO(appointment.to) : new Date();
  const isPast = appointment.to ? new Date(appointment.to) < new Date() : false;

  // 🚀 ДОДАНО: Перевірка, чи можна скасувати (статус Planned/Reserved і час ще не минув)
  const canCancel = !isPast && (appointment.status === "PLANNED" || appointment.status === "RESERVED");

  return (
    <div className={`appt-card glass-light ${isPast ? 'is-past' : 'is-upcoming'}`}>
      <div className="appt-main-info">
        <div className="doctor-mini-profile">
          <div className="avatar-container">
            <img
              src={doctor?.avatarUrl || DEFAULT_AVATAR}
              alt="Doctor"
              onError={(e) => { (e.currentTarget.src = DEFAULT_AVATAR); }}
            />
          </div>
          <div className="name-group">
            <h4>{doctor?.fullName || "Лікар не знайдений"}</h4>
            <span className="specialty-label">
              {doctor?.specializationName || doctor?.specializationId || "Медичний спеціаліст"}
            </span>
          </div>
        </div>

        <div className="time-info-block">
          <div className="info-item">
            <CalendarDays size={18} className="text-purple" />
            <span>{appointment.from ? format(startDate, "d MMMM yyyy", { locale: uk }) : "Дата невідома"}</span>
          </div>
          <div className="info-item">
            <Clock size={18} className="text-blue" />
            <span>{appointment.from && appointment.to ? `${format(startDate, "HH:mm")} — ${format(endDate, "HH:mm")}` : "Час не вказано"}</span>
          </div>
        </div>
      </div>

      <div className="appt-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className={`status-badge ${(appointment.status || "PLANNED").toLowerCase()}`}>
          {isPast && appointment.status !== "CANCELLED" ? (
            <><CheckCircle2 size={14} /> Завершено</>
          ) : appointment.status === "CANCELLED" ? (
            <><XCircle size={14} /> Скасовано</>
          ) : (
            <><Clock3 size={14} /> {appointment.status === "PLANNED" || appointment.status === "RESERVED" ? "Заплановано" : appointment.status}</>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {/* 🚀 ДОДАНО: Кнопка скасування */}
          {canCancel && (
            <button
              className="btn-details"
              style={{ color: "#ef4444", backgroundColor: "#fef2f2", borderColor: "#fecaca" }}
              onClick={(e) => {
                e.stopPropagation(); // Щоб не спрацював перехід на сторінку деталей
                e.preventDefault();
                onCancel?.(appointment);
              }}
            >
              Скасувати <XCircle size={14} />
            </button>
          )}

          {appointment.doctorId && (
            <button
              className="btn-details"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/doctors/${appointment.doctorId}`);
              }}
            >
              Профіль лікаря <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
