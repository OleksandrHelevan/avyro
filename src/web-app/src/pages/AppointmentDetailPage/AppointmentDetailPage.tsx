import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, User, Stethoscope,
  Phone, Mail, Coins, CheckCircle2, XCircle, Timer, RefreshCw,
} from "lucide-react";
import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors.ts";
import Loader from "../../components/Loader/Loader.tsx";
import "./AppointmentDetailPage.css";
import { useMemo } from "react";
import {useAppointment} from "../../domains/appointments/useAppointments/useAppointments.ts";

// ── Helpers ───────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: any }> = {
  RESERVED:  { label: "Заплановано", className: "status--reserved",  Icon: Timer },
  FINISHED:  { label: "Завершено",   className: "status--finished",  Icon: CheckCircle2 },
  CANCELLED: { label: "Скасовано",   className: "status--cancelled", Icon: XCircle },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
}
function durationMin(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 60000);
}

function Avatar({ name, url, size = 56 }: { name?: string; url?: string; size?: number }) {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  if (url) return <img src={url} alt={name} className="adp-avatar-img" style={{ width: size, height: size }} />;
  return (
    <div className="adp-avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: appt, isLoading, isError, refetch, isFetching } = useAppointment(id || "");
  const { data: rawDoctors = [] } = useGetDoctors();

  // If backend doesn't embed doctor — find from doctors list
  const doctorsList = useMemo(() => {
    if (Array.isArray(rawDoctors)) return rawDoctors;
    return (rawDoctors as any)?.data || [];
  }, [rawDoctors]);

  const doctor = useMemo(() => {
    if (appt?.doctor) return appt.doctor;
    return doctorsList.find((d: any) => {
      const dId = d.id || d._id;
      return dId && appt?.doctorId && dId.toString() === appt.doctorId.toString();
    });
  }, [appt, doctorsList]);

  if (isLoading) return <div className="loading-screen"><Loader /></div>;
  if (isError || !appt) return (
    <div className="adp-error">
      <XCircle size={40} />
      <p>Не вдалося завантажити запис</p>
      <button onClick={() => navigate(-1)}>← Назад</button>
    </div>
  );

  const statusCfg = STATUS_CONFIG[appt.status] || { label: appt.status, className: "status--reserved", Icon: Timer };
  const StatusIcon = statusCfg.Icon;
  const duration = appt.from && appt.to ? durationMin(appt.from, appt.to) : null;

  return (
    <div className="adp-page">
      <div className="adp-container">

        {/* ── Back + refresh ── */}
        <div className="adp-topbar">
          <button className="adp-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} /> Мої візити
          </button>
          <button className="adp-refresh" onClick={() => refetch()} disabled={isFetching} title="Оновити">
            <RefreshCw size={14} className={isFetching ? "adp-spin" : ""} />
          </button>
        </div>

        {/* ── Status banner ── */}
        <div className={`adp-status-banner ${statusCfg.className}`}>
          <StatusIcon size={16} />
          <span>{statusCfg.label}</span>
        </div>

        {/* ── Date card ── */}
        <div className="adp-card adp-date-card">
          <div className="adp-date-main">
            <div className="adp-date-icon"><Calendar size={20} /></div>
            <div>
              <div className="adp-date-day">{appt.from ? formatDate(appt.from) : "—"}</div>
              <div className="adp-date-time">
                <Clock size={13} />
                {appt.from ? formatTime(appt.from) : "—"}
                {appt.to && ` — ${formatTime(appt.to)}`}
                {duration && <span className="adp-duration">· {duration} хв</span>}
              </div>
            </div>
          </div>
        </div>

        {/* ── Doctor card ── */}
        {doctor && (
          <div className="adp-card">
            <div className="adp-card-label"><Stethoscope size={13} />Лікар</div>
            <div className="adp-person-row">
              <Avatar name={doctor.fullName || doctor.full_name} url={doctor.avatarUrl || doctor.avatar_url} />
              <div className="adp-person-info">
                <div className="adp-person-name">{doctor.fullName || doctor.full_name || "—"}</div>
                {(doctor.specializationName || doctor.specialization_name) && (
                  <div className="adp-person-spec">{doctor.specializationName || doctor.specialization_name}</div>
                )}
              </div>
            </div>
            <div className="adp-contacts">
              {(doctor.phone) && (
                <a href={`tel:${doctor.phone}`} className="adp-contact-row">
                  <Phone size={14} />{doctor.phone}
                </a>
              )}
              {(doctor.email) && (
                <a href={`mailto:${doctor.email}`} className="adp-contact-row">
                  <Mail size={14} />{doctor.email}
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Patient card (if embedded) ── */}
        {appt.patient && (
          <div className="adp-card">
            <div className="adp-card-label"><User size={13} />Пацієнт</div>
            <div className="adp-person-row">
              <Avatar name={appt.patient.fullName} url={appt.patient.avatarUrl} />
              <div className="adp-person-info">
                <div className="adp-person-name">{appt.patient.fullName}</div>
                {appt.patient.email && <div className="adp-person-spec">{appt.patient.email}</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── Price card ── */}
        {appt.price != null && (
          <div className="adp-card adp-price-card">
            <div className="adp-card-label"><Coins size={13} />Вартість</div>
            <div className="adp-price-val">{appt.price} ₴</div>
            {appt.status === "FINISHED" && (
              <div className="adp-paid-badge"><CheckCircle2 size={13} />Сплачено</div>
            )}
          </div>
        )}

        {/* ── Meta IDs ── */}
        <div className="adp-meta">
          <span>ID: <code>{appt._id}</code></span>
          {appt.slotId && <span>Слот: <code>{appt.slotId}</code></span>}
        </div>

      </div>
    </div>
  );
}
