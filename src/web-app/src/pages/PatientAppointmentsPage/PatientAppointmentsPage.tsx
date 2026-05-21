import { useMemo } from "react";
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

  const { data: rawAppointments, isLoading: isApptsLoading } = useQuery({
    queryKey: ["myAppointments"],
    queryFn: () => appointmentsService.getMyPatientAppointments(),
  });

  const { data: rawDoctors = [], isLoading: isDocsLoading } = useGetDoctors();

  const doctorsList = useMemo(() => {
    if (Array.isArray(rawDoctors)) return rawDoctors;
    return (rawDoctors as any)?.data || (rawDoctors as any)?.items || [];
  }, [rawDoctors]);

  // 3. Форматуємо отримані записи
  const appointments = useMemo(() => {
    const appts = (rawAppointments as any)?.data || (rawAppointments as any)?.items || rawAppointments || [];
    return Array.isArray(appts) ? appts : [];
  }, [rawAppointments]);

  // Сортування: Майбутні записи спочатку (від найближчих до найвіддаленіших)
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      if (!a.from || !b.from) return 0;
      return new Date(a.from).getTime() - new Date(b.from).getTime();
    });
  }, [appointments]);

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

        <div className="appointments-container">
          {sortedAppointments.length === 0 ? (
            <div className="empty-state-card glass-light">
              <div className="empty-icon-wrapper">
                <CalendarDays size={48} />
              </div>
              <h3>У вас ще немає записів</h3>
              <p>Оберіть найкращого спеціаліста та запишіться на консультацію вже сьогодні.</p>
              <button onClick={() => navigate('/')} className="btn-primary-glow">
                Знайти лікаря
              </button>
            </div>
          ) : (
            <div className="appointments-grid-list">
              {sortedAppointments.map((appt: any, index: number) => {
                const doctor = doctorsList.find((d: any) => {
                  const dId = d.id || d._id;
                  return dId && appt.doctorId && dId.toString() === appt.doctorId.toString();
                });

                return (
                  <AppointmentCard
                    key={appt._id || appt.id || index}
                    appointment={appt}
                    doctor={doctor}
                  />
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
