import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ChevronRight, CheckCircle2, Timer, XCircle, Stethoscope } from "lucide-react";
import Loader from "../../components/Loader/Loader.tsx";

import "./DoctorAppointmentsPage.css";
import {useGetDoctorAppointments} from "../../domains/users/useGetDoctorAppointments/useGetDoctorAppointments.ts";

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

// ── Main Component ──
export default function DoctorAppointmentsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"ALL" | "PLANNED" | "FINISHED" | "CANCELLED">("ALL");

  const { data: rawAppointments, isLoading, isError } = useGetDoctorAppointments();

  const appointments = useMemo(() => {
    if (!rawAppointments) return [];
    const list = Array.isArray(rawAppointments) ? rawAppointments : (rawAppointments as any)?.items || [];

    // Фільтруємо записи
    return list.filter((appt: any) => {
      if (filter === "ALL") return true;
      if (filter === "PLANNED") return appt.status === "PLANNED" || appt.status === "RESERVED";
      return appt.status === filter;
    }).sort((a: any, b: any) => new Date(b.from).getTime() - new Date(a.from).getTime()); // Новіші зверху
  }, [rawAppointments, filter]);

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
      <div className="dap-container">

        <div className="dap-header">
          <div className="dap-header-title">
            <Stethoscope size={28} color="black" />
            <h1>Мої прийоми</h1>
          </div>
          <p className="dap-subtitle">Управління графіком та візитами пацієнтів</p>
        </div>

        {/* ── Фільтри ── */}
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

        {/* ── Список записів ── */}
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

              return (
                <div
                  key={appt._id || appt.id}
                  className="dap-card"
                  onClick={() => navigate(`/appointments/${appt._id || appt.id}`)}
                >
                  <div className="dap-card-top">
                    <div className={`dap-badge ${statusCfg.className}`}>
                      <StatusIcon size={14} /> {statusCfg.label}
                    </div>

                  </div>

                  <div className="dap-card-middle">
                    <Avatar name={patientName} url={patientUrl} />
                    <div className="dap-patient-info">
                      <span className="dap-patient-label"><User size={12} /> Пацієнт</span>
                      <h4>{patientName}</h4>
                    </div>
                  </div>

                  <div className="dap-divider"></div>

                  <div className="dap-card-bottom">
                    <div className="dap-datetime">
                      <div className="dap-dt-item">
                        <Calendar size={16} /> {appt.from ? formatDate(appt.from) : "—"}
                      </div>
                      <div className="dap-dt-item">
                        <Clock size={16} /> {appt.from ? formatTime(appt.from) : "—"}
                      </div>
                    </div>
                    <button className="dap-action-btn">
                      Деталі <ChevronRight size={16} />
                    </button>
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
