import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import "../HomePage/HomePage.css";
import {userService} from "../../domains/users/service/userService.ts";

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const dayNames: Record<number, string> = {
  1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб", 7: "Нд"
};

const monthNames = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
];

const DoctorProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 1. Отримуємо дані лікаря (використовуємо ваш сервіс)
  const { data: doctor, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => userService.getDoctorById(id!),
    enabled: !!id,
  });

  const { data: allSchedules, isLoading: isScheduleLoading } = useQuery({
    queryKey: ["admin-schedules"],
    queryFn: () => userService.getAdminSchedules(),
  });

  // Фільтруємо розклад саме для цього лікаря
  // Додано перевірку на doctorId та id (враховуючи можливі типи даних)
  const doctorSchedules = Array.isArray(allSchedules)
    ? allSchedules.filter((s: any) => String(s.doctorId) === String(id))
    : [];

  if (isDoctorLoading) return <div className="loading-screen">Завантаження профілю...</div>;

  // Якщо дані профілю прийшли пусті або з null
  const displayName = doctor?.fullName || "Спеціаліст";
  const displayEmail = doctor?.email || "Email не вказано";

  return (
    <div className="aero-viewport light-theme" style={{ padding: "3rem 1.5rem" }}>
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
      </div>

      <main className="main-content" style={{ maxWidth: "800px", margin: "0 auto" }}>

        <button className="btn-profile-light btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: "2rem", width: 'auto' }}>
          ← Назад
        </button>

        {/* Картка профілю */}
        <motion.div className="create-card glass-light" variants={fadeUpVariant} initial="hidden" animate="visible">
          <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: 'wrap' }}>
            <div className="doctor-avatar-placeholder" style={{
              width: "120px", height: "120px", borderRadius: "50%",
              backgroundImage: doctor?.avatarUrl ? `url(${doctor.avatarUrl})` : "none",
              backgroundColor: '#eee'
            }}></div>
            <div>
              <h1 className="med-title-dark" style={{ margin: 0 }}>{displayName}</h1>

              <p style={{ color: "#6b7280", marginTop: '8px' }}>✉️ {displayEmail}</p>
            </div>
          </div>
        </motion.div>

        {/* Секція розкладу */}
        <motion.div
          className="create-card glass-light"
          style={{ marginTop: "2rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="section-title">📅 Графік роботи</h2>

          {isScheduleLoading ? (
            <p>Завантаження графіка...</p>
          ) : doctorSchedules.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
              <p>Розклад наразі відсутній або очікує підтвердження.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {doctorSchedules.map((item: any, idx: number) => {
                // Гнучке витягування даних (якщо repeating вкладений або поля лежать в корені)
                const rep = item.repeating || item;
                const days = Array.isArray(rep.daysOfWeek)
                  ? rep.daysOfWeek.map((d: number) => dayNames[d]).join(", ")
                  : "Не вказано";

                return (
                  <div key={idx} className="glass-light" style={{
                    padding: "1.2rem",
                    borderRadius: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid rgba(255,255,255,0.5)",
                    background: 'rgba(255,255,255,0.4)'
                  }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#1e293b' }}>{item.title || "Регулярний графік"}</h4>
                      <p style={{ margin: "5px 0", color: "#4f46e5", fontWeight: "bold" }}>
                        {item.month ? monthNames[item.month - 1] : ""} {item.year}
                      </p>
                      <p style={{ margin: 0, fontSize: "0.9rem", color: '#475569' }}>
                        <strong>Дні:</strong> {days}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "6px 16px",
                        borderRadius: "20px",
                        fontWeight: "bold",
                        fontSize: '0.95rem'
                      }}>
                        {rep.startTime} - {rep.endTime}
                      </div>
                      <p style={{ fontSize: "0.8rem", marginTop: "6px", color: "#94a3b8" }}>
                        Сеанс: {rep.slotDuration || 30} хв
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DoctorProfilePage;
