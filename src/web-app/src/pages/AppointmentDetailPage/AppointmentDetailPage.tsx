import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Calendar, Clock, User, Stethoscope,
  Phone, Mail, Coins, CheckCircle2, XCircle, Timer,
  MessageSquare, ExternalLink, RefreshCw,
} from "lucide-react";
import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors.ts";
import { useAuth } from "../../context/auth/useAuth.tsx";
import Loader from "../../components/Loader/Loader.tsx";
import "./AppointmentDetailPage.css";
import { useMemo } from "react";
import { useAppointment } from "../../domains/appointments/useAppointments/useAppointments.ts";


const STATUS_CONFIG: Record<string, { label: string; className: string; Icon: any }> = {
  PLANNED:   { label: "Заплановано", className: "status--reserved",  Icon: Timer },
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

function Avatar({ name, url, size = 52 }: { name?: string; url?: string; size?: number }) {
  const initials = (name || "?").split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  if (url) return <img src={url} alt={name} className="adp-avatar-img" style={{ width: size, height: size }} />;
  return (
    <div className="adp-avatar-fallback" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      {initials}
    </div>
  );
}


export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDoctor, isPatient } = useAuth();

  const { data: appt, isLoading, isError, refetch, isFetching } = useAppointment(id || "");
  const { data: rawDoctors = [] } = useGetDoctors();

  const doctorsList = useMemo(() => {
    if (Array.isArray(rawDoctors)) return rawDoctors;
    return (rawDoctors as any)?.data || [];
  }, [rawDoctors]);

  const doctor = useMemo(() => {
    if ((appt as any)?.doctor) return (appt as any).doctor;
    return doctorsList.find((d: any) => {
      const dId = d.id || d._id;
      return dId && appt?.doctorId && dId.toString() === appt.doctorId.toString();
    });
  }, [appt, doctorsList]);

  if (isLoading) return <div className="loading-screen"><Loader /></div>;
  if (isError || !appt) return (
    <div className="adp-error" style={{ paddingTop: "120px" }}>
      <XCircle size={40} /><p>Не вдалося завантажити запис</p>
      <button onClick={() => navigate(-1)}>← Назад</button>
    </div>
  );

  const apptData: any = appt;
  const statusCfg = STATUS_CONFIG[appt.status] || { label: appt.status, className: "status--reserved", Icon: Timer };
  const StatusIcon = statusCfg.Icon;
  const duration = appt.from && appt.to ? durationMin(appt.from, appt.to) : null;

  const patientNoteObj = Array.isArray(apptData.notes)
    ? apptData.notes.find((n: any) => n.source === "PATIENT" || n.type === "SPECIFICATION")
    : null;
  const appointmentNote = patientNoteObj?.message || apptData.note || apptData.comment || apptData.description;

  const possiblePrices = [
    apptData.finalPrice, apptData.basePrice, apptData.price,
    apptData.payload?.price, apptData.payload?.pricePerSlot,
    doctor?.price, doctor?.pricePerSlot, doctor?.consultationPrice,
  ];
  const validPrice = possiblePrices.map(p => Number(p)).find(p => !isNaN(p) && p > 0);

  const doctorId = appt.doctorId || doctor?._id || doctor?.id;
  const patientId = appt.patientId;


  const handleViewProfile = () => {
    if (isDoctor && patientId) {
      navigate(`/patients/${patientId}`);
    } else if (isPatient && doctorId) {
      navigate(`/doctors/${doctorId}`);
    }
  };

  const profileLinkLabel = isDoctor
    ? "Профіль пацієнта"
    : "Профіль лікаря";

  const canViewProfile = (isDoctor && !!patientId) || (isPatient && !!doctorId);

  return (
    <div className="adp-page" style={{ paddingTop: "120px" }}>
      <div className="adp-container">

        <div className="adp-topbar">
          <button className="adp-back" onClick={() => navigate(-1)}>
            <ArrowLeft size={18} /> Назад
          </button>
          <button className="adp-refresh" onClick={() => refetch()} disabled={isFetching} title="Оновити">
            <RefreshCw size={14} className={isFetching ? "adp-spin" : ""} />
          </button>
        </div>

        <div className="adp-unified-card">

          <div className="adp-unified-header">
            <h2 className="adp-unified-title">Деталі візиту</h2>
            <div className={`adp-status-badge ${statusCfg.className}`}>
              <StatusIcon size={14} /><span>{statusCfg.label}</span>
            </div>
          </div>

          <div className="adp-divider" />

          <div className="adp-section">
            <div className="adp-section-label"><Calendar size={14} />Дата та час</div>
            <div className="adp-date-main">
              <div className="adp-date-icon"><Calendar size={20} /></div>
              <div>
                <div className="adp-date-day">{appt.from ? formatDate(appt.from) : "—"}</div>
                <div className="adp-date-time">
                  <Clock size={14} />
                  {appt.from ? formatTime(appt.from) : "—"}
                  {appt.to && ` — ${formatTime(appt.to)}`}
                  {duration && <span className="adp-duration">· {duration} хв</span>}
                </div>
              </div>
            </div>
          </div>

          {doctor && (
            <>
              <div className="adp-divider" />
              <div className="adp-section">
                <div className="adp-section-label-row">
                  <div className="adp-section-label"><Stethoscope size={14} />Лікар</div>
                  {isPatient && doctorId && (
                    <button className="adp-profile-link" onClick={() => navigate(`/doctors/${doctorId}`)}>
                      <ExternalLink size={12} /> Профіль лікаря
                    </button>
                  )}
                </div>
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
                  {doctor.phone && <a href={`tel:${doctor.phone}`} className="adp-contact-row"><Phone size={14} />{doctor.phone}</a>}
                  {doctor.email && <a href={`mailto:${doctor.email}`} className="adp-contact-row"><Mail size={14} />{doctor.email}</a>}
                </div>
              </div>
            </>
          )}

          {apptData.patient && (
            <>
              <div className="adp-divider" />
              <div className="adp-section">
                <div className="adp-section-label-row">
                  <div className="adp-section-label"><User size={14} />Пацієнт</div>
                  {isDoctor && patientId && (
                    <button className="adp-profile-link" onClick={() => navigate(`/patients/${patientId}`)}>
                      <ExternalLink size={12} /> Профіль пацієнта
                    </button>
                  )}
                </div>
                <div className="adp-person-row">
                  <Avatar name={apptData.patient.fullName} url={apptData.patient.avatarUrl} />
                  <div className="adp-person-info">
                    <div className="adp-person-name">{apptData.patient.fullName}</div>
                    {apptData.patient.email && <div className="adp-person-spec">{apptData.patient.email}</div>}
                    {apptData.patient.phone && (
                      <a href={`tel:${apptData.patient.phone}`} className="adp-contact-row" style={{ marginTop: 4 }}>
                        <Phone size={13} />{apptData.patient.phone}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {appointmentNote && (
            <>
              <div className="adp-divider" />
              <div className="adp-section">
                <div className="adp-section-label"><MessageSquare size={14} />Коментар до запису</div>
                <div className="adp-note-block">"{appointmentNote}"</div>
              </div>
            </>
          )}

          {(validPrice || appt.price != null) && (
            <>
              <div className="adp-divider" />
              <div className="adp-section adp-price-section">
                <div className="adp-section-label"><Coins size={14} />Вартість</div>
                <div className="adp-price-row">
                  <div className="adp-price-val">{validPrice ?? appt.price} ₴</div>
                  {appt.status === "FINISHED" && (
                    <div className="adp-paid-badge"><CheckCircle2 size={14} />Сплачено</div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>

        {canViewProfile && !apptData.patient && !apptData.doctor && (
          <button className="adp-view-profile-btn" onClick={handleViewProfile}>
            <ExternalLink size={15} /> {profileLinkLabel}
          </button>
        )}

      </div>
    </div>
  );
}
