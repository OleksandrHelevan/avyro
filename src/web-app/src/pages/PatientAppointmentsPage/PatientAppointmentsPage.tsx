import { useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, X, AlertTriangle, Loader2 } from "lucide-react"; // Додано іконки
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { useGetDoctors } from "../../domains/users/useGetDoctors/useGetDoctors";
import { appointmentsService } from "../../domains/appointments/service/appointmentsService.ts";
import { useCancelAppointment } from "../../domains/appointments/useCancelAppointment/useCancelAppointment.ts"; // 🚀 ДОДАНО
import Loader from "../../components/Loader/Loader.tsx";
import "./PatientAppointmentsPage.css";
import AppointmentCard, { type AppointmentInfo } from "./components/AppointmentCard.tsx";

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();

  const [filter, setFilter] = useState<"ALL" | "PLANNED" | "FINISHED" | "CANCELLED">("ALL");

  // 🚀 ДОДАНО: Стейт для модалки скасування
  const [apptToCancel, setApptToCancel] = useState<AppointmentInfo | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const { mutate: cancelAppointment, isPending: isCanceling } = useCancelAppointment();

  const { data: rawAppointments, isLoading: isApptsLoading } = useQuery({
    queryKey: ["myAppointments"],
    queryFn: () => appointmentsService.getMyPatientAppointments(),
  });

  const { data: rawDoctors = [], isLoading: isDocsLoading } = useGetDoctors();

  const doctorsList = useMemo(() => {
    if (Array.isArray(rawDoctors)) return rawDoctors;
    return (rawDoctors as any)?.data || (rawDoctors as any)?.items || [];
  }, [rawDoctors]);

  const appointments = useMemo(() => {
    const appts = (rawAppointments as any)?.data || (rawAppointments as any)?.items || rawAppointments || [];
    return Array.isArray(appts) ? appts : [];
  }, [rawAppointments]);

  const filteredAndSortedAppointments = useMemo(() => {
    const filtered = appointments.filter((appt: any) => {
      if (filter === "ALL") return true;
      if (filter === "PLANNED") return appt.status === "PLANNED" || appt.status === "RESERVED";
      return appt.status === filter;
    });

    return filtered.sort((a: any, b: any) => {
      if (!a.from || !b.from) return 0;
      if (filter === "FINISHED" || filter === "CANCELLED") {
        return new Date(b.from).getTime() - new Date(a.from).getTime();
      }
      return new Date(a.from).getTime() - new Date(b.from).getTime();
    });
  }, [appointments, filter]);

  // 🚀 ДОДАНО: Обробник підтвердження
  const handleConfirmCancel = () => {
    if (!apptToCancel) return;
    const apptId = apptToCancel._id || apptToCancel.id;
    if (!apptId) return;

    cancelAppointment(
      { id: apptId, reason: cancelReason },
      {
        onSuccess: () => {
          setApptToCancel(null);
          setCancelReason("");
        }
      }
    );
  };

  if (isApptsLoading || isDocsLoading) return <Loader />;

  return (
    <div className="aero-viewport light-theme appointments-page">
      {/* 🚀 ДОДАНО: Модалка скасування (використовуємо існуючі класи або inline-стилі) */}
      {apptToCancel && (
        <div className="modal-backdrop" style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', position: 'fixed', inset: 0 }}>
          <div className="modal-box" style={{ background: '#fff', padding: '24px', borderRadius: '20px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <AlertTriangle color="#ef4444" size={20} /> Скасування візиту
              </h3>
              <button onClick={() => setApptToCancel(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
              Ви впевнені, що хочете скасувати цей запис? Це дія незворотна.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>
                Причина скасування (необов'язково)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Наприклад: змінилися плани, захворів..."
                style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '80px', fontSize: '14px', resize: 'none' }}
                disabled={isCanceling}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setApptToCancel(null)}
                disabled={isCanceling}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Повернутися
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isCanceling}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}
              >
                {isCanceling ? <><Loader2 size={18} className="spin" /> Скасування...</> : "Скасувати візит"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      onCancel={(a) => setApptToCancel(a)} // 🚀 Виклик модалки
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
