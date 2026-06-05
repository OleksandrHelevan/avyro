import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors";
import { appointmentsService } from "../../domains/appointments/service/appointmentsService.ts";
import Loader from "../../components/Loader/Loader.tsx";
import "./PatientAppointmentsPage.css";
import AppointmentCard from "./components/AppointmentCard.tsx";

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();

  // 🚀 ДОДАНО: Стан для фільтру
  const [filter, setFilter] = useState<"ALL" | "PLANNED" | "FINISHED" | "CANCELLED">("ALL");

  const { data: rawAppointments, isLoading: isApptsLoading } = useQuery({
    queryKey: ["myAppointments"],
    queryFn: () => appointmentsService.getMyPatientAppointments(),
  });

  const { data: rawDoctors = [], isLoading: isDocsLoading } = useGetDoctors();

  const doctorsList = useMemo(() => {
    if (Array.isArray(rawDoctors)) return rawDoctors;
    return (rawDoctors as any)?.data || (rawDoctors as any)?.items || [];
  }, [rawDoctors]);

  // Форматуємо отримані записи
  const appointments = useMemo(() => {
    const appts = (rawAppointments as any)?.data || (rawAppointments as any)?.items || rawAppointments || [];
    return Array.isArray(appts) ? appts : [];
  }, [rawAppointments]);

  // 🚀 ДОДАНО: Фільтрація та розумне сортування
  const filteredAndSortedAppointments = useMemo(() => {
    // Спочатку фільтруємо
    const filtered = appointments.filter((appt: any) => {
      if (filter === "ALL") return true;
      if (filter === "PLANNED") return appt.status === "PLANNED" || appt.status === "RESERVED";
      return appt.status === filter;
    });

    // Потім сортуємо
    return filtered.sort((a: any, b: any) => {
      if (!a.from || !b.from) return 0;

      // Для історії (завершені/скасовані) показуємо найновіші зверху
      if (filter === "FINISHED" || filter === "CANCELLED") {
        return new Date(b.from).getTime() - new Date(a.from).getTime();
      }

      // Для запланованих (і вкладки "Всі") показуємо найближчі події зверху
      return new Date(a.from).getTime() - new Date(b.from).getTime();
    });
  }, [appointments, filter]);

  if (isApptsLoading || isDocsLoading) {
    return <Loader />;
  }

  return (
    <div className="aero-viewport light-theme appointments-page">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
        <div className="light-blob blob-2"></div>
      </div>

      <main className="main-content">
        <header className="page-header-alt">
          <button onClick={() => navigate(-1)} className="back-link">
            <ArrowLeft size={18} /> Назад
          </button>
          <div className="header-text-group">
            <h1>Мої візити</h1>
            <p>Керуйте своїми записами та переглядайте історію лікування</p>
          </div>
        </header>

        {/* 🚀 ДОДАНО: Блок з кнопками фільтрів */}
        <div className="patient-filters">
          {[
            { id: "ALL", label: "Всі" },
            { id: "PLANNED", label: "Заплановані" },
            { id: "FINISHED", label: "Завершені" },
            { id: "CANCELLED", label: "Скасовані" },
          ].map((f) => (
            <button
              key={f.id}
              className={`patient-filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id as any)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="appointments-container">
          {filteredAndSortedAppointments.length === 0 ? (
            <div className="empty-state-card glass-light">
              <div className="empty-icon-wrapper">
                <CalendarDays size={48} />
              </div>
              <h3>У вас немає записів</h3>
              <p>За обраним фільтром візитів не знайдено.</p>
              {filter === "ALL" && (
                <button onClick={() => navigate('/')} className="btn-primary-glow">
                  Знайти лікаря
                </button>
              )}
            </div>
          ) : (
            <div className="appointments-grid-list">
              {filteredAndSortedAppointments.map((appt: any, index: number) => {
                const doctor = doctorsList.find((d: any) => {
                  const dId = d.id || d._id;
                  return dId && appt.doctorId && dId.toString() === appt.doctorId.toString();
                });

                const appointmentId = appt._id || appt.id;

                return (
                  <div
                    key={appointmentId || index}
                    onClick={() => {
                      if (appointmentId) {
                        navigate(`/appointments/${appointmentId}`);
                      }
                    }}
                    style={{ cursor: "pointer", display: "block", textDecoration: "none" }}
                    className="clickable-appointment-card"
                  >
                    <AppointmentCard
                      appointment={appt}
                      doctor={doctor}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
