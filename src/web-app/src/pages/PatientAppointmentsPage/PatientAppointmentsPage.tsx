import  { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { uk } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// Підключаємо ваш сервіс (перевірте, чи правильний шлях до файлу!)
import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors";

import "./PatientAppointmentsPage.css";
import {userService} from "../../domains/users/service/userService.ts";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Doctor&background=E0E7FF&color=4F46E5&size=128";

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();

  // Дістаємо ID поточного пацієнта з локального сховища
  const userId = localStorage.getItem("userId")?.replace(/"/g, '') || "";

  // 1. Отримуємо профіль пацієнта (разом із його записами)
  const { data: rawPatient, isLoading: isPatientLoading } = useQuery({
    queryKey: ["patient", userId],
    queryFn: () => userService.getPatientById(userId),
    enabled: !!userId, // Запит піде тільки якщо є userId
  });

  // 2. Отримуємо список всіх лікарів
  const { data: doctors = [], isLoading: isDocsLoading } = useGetDoctors();

  // 3. Витягуємо записи (appointments) з об'єкта пацієнта
  const appointments = useMemo(() => {
    // Враховуємо вкладеність, якщо бекенд загортає у { data: ... }
    const patientData = (rawPatient as any)?.data || rawPatient;

    // Шукаємо масив записів (може називатися appointments, schedule або records)
    const appts = patientData?.appointments || patientData?.schedule || patientData?.records || [];

    return Array.isArray(appts) ? appts : [];
  }, [rawPatient]);

  // Сортування: Майбутні записи спочатку (від найближчих до найвіддаленіших)
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      // Якщо немає поля from, залишаємо як є
      if (!a.from || !b.from) return 0;
      return new Date(a.from).getTime() - new Date(b.from).getTime();
    });
  }, [appointments]);

  if (isPatientLoading || isDocsLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner-box">
          <span className="spinner">⏳</span>
          <p>Завантажуємо ваші візити...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aero-viewport light-theme appointments-page">
      {/* Фоновий декор */}
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
                // Знаходимо лікаря по doctorId
                const doctor = doctors.find((d: any) => (d.id || d._id) === appt.doctorId);

                // Якщо раптом бекенд повернув невалідну дату, захищаємо код
                const startDate = appt.from ? parseISO(appt.from) : new Date();
                const endDate = appt.to ? parseISO(appt.to) : new Date();
                const isPast = appt.to ? new Date(appt.to) < new Date() : false;

                return (
                  <div
                    key={appt._id || appt.id || index}
                    className={`appt-card glass-light ${isPast ? 'is-past' : 'is-upcoming'}`}
                  >
                    <div className="appt-main-info">
                      <div className="doctor-mini-profile">
                        <div className="avatar-container">
                          <img
                            src={doctor?.avatarUrl || DEFAULT_AVATAR}
                            alt="Doctor"
                            onError={(e) => {(e.currentTarget.src = DEFAULT_AVATAR)}}
                          />
                        </div>
                        <div className="name-group">
                          <h4>{doctor?.fullName || "Завантаження імені..."}</h4>
                          <span className="specialty-label">
  {(doctor as any)?.specializationName || "Медичний спеціаліст"}
</span>
                        </div>
                      </div>

                      <div className="time-info-block">
                        <div className="info-item">
                          <CalendarDays size={18} className="text-purple" />
                          <span>{appt.from ? format(startDate, "d MMMM yyyy", { locale: uk }) : "Дата невідома"}</span>
                        </div>
                        <div className="info-item">
                          <Clock size={18} className="text-blue" />
                          <span>{appt.from && appt.to ? `${format(startDate, "HH:mm")} — ${format(endDate, "HH:mm")}` : "Час не вказано"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="appt-footer">
                      <div className={`status-badge ${(appt.status || "PLANNED").toLowerCase()}`}>
                        {isPast ? (
                          <><CheckCircle2 size={14} /> Завершено</>
                        ) : (
                          <><Clock3 size={14} /> {appt.status === "PLANNED" ? "Заплановано" : (appt.status || "Очікує")}</>
                        )}
                      </div>

                      {appt.doctorId && (
                        <button
                          className="btn-details"
                          onClick={() => navigate(`/doctor/${appt.doctorId}`)}
                        >
                          Профіль лікаря <ExternalLink size={14} />
                        </button>
                      )}
                    </div>
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
