import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Прямі імпорти ваших хуків з правильними шляхами
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import { useSpecializations } from "../../domains/users/useSpecializations/useSpecializations";
import { useRequestSchedule } from "../../domains/users/useRequestSchedule/useRequestSchedule";
// Якщо ви вже перенесли цю папку всередину users, змініть шлях на "../../domains/users/useUpdateDoctor/useUpdateDoctor"
import { useUpdateDoctor } from "../../domains/users/useUpdateDoctor/useUpdateDoctor";

import "./DoctorProfile.css";

const CURRENT_USER_ID = (localStorage.getItem("userId") || "").replace(/"/g, '');

export default function DoctorProfile() {
  // --- ХУКИ ---
  const { data: doctor, isLoading: isDoctorLoading } = useDoctor(CURRENT_USER_ID);
  const { data: specializations, isLoading: isSpecsLoading } = useSpecializations();
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();
  const { mutate: requestSchedule, isPending: isScheduling } = useRequestSchedule();

  // --- СТЕЙТ ПРОФІЛЮ ---
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specializationId: "",
  });

  // --- СТЕЙТ РОЗКЛАДУ ---
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    month: new Date().getMonth() + 1, // Поточний місяць
    year: new Date().getFullYear(),   // Поточний рік
    title: "Стандартний прийом",
    startTime: "09:00",
    endTime: "18:00",
    slotDuration: 30,
  });

  // Заповнення форми при завантаженні даних лікаря
  useEffect(() => {
    if (doctor) {
      // Припускаємо, що бекенд повертає full_name або fullName
      const rawName = (doctor as any).fullName || (doctor as any).full_name || "";
      const nameParts = rawName.trim().split(/\s+/);
      const first = nameParts[0] || "";
      const last = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: first,
        lastName: last,
        specializationId: (doctor as any).specializationId || (doctor as any).specialization_id || "",
      });
    }
  }, [doctor]);

  // --- ОБРОБНИКИ ---
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!CURRENT_USER_ID) {
      toast.error("Помилка: ID користувача не знайдено");
      return;
    }

    updateDoctor({
      id: CURRENT_USER_ID,
      data: {
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
        specialization_id: formData.specializationId,
      }
    });
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Відправляємо запит на розклад у новому форматі
    requestSchedule({
      doctorId: CURRENT_USER_ID,
      month: Number(scheduleData.month),
      year: Number(scheduleData.year),
      title: scheduleData.title,
      isRepeated: true,
      repeating: {
        type: "WEEKLY",
        daysOfWeek: [1, 3, 5], // Пн, Ср, Пт
        startTime: scheduleData.startTime,
        endTime: scheduleData.endTime,
        slotDuration: Number(scheduleData.slotDuration),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone // Автоматично бере локальну таймзону
      }
    }, {
      onSuccess: () => {
        setShowScheduleForm(false);
      }
    });
  };

  if (isDoctorLoading) return <div className="loading-screen"><span className="spinner">⏳</span></div>;

  return (
    <div className="aero-viewport light-theme profile-page doctor-theme">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1" style={{background: 'rgba(59, 206, 181, 0.3)'}}></div>
        <div className="light-blob blob-2" style={{background: 'rgba(59, 130, 246, 0.3)'}}></div>
      </div>

      <div className="main-content">
        <div className="layout-container">
          {/* САЙДБАР */}
          <aside className="sidebar">
            <div className="sidebar-menu glass-light">
              <button className="menu-item active">👨‍⚕️ Кабінет лікаря</button>
              <button className="menu-item">📅 Мій розклад</button>
              <button className="menu-item">👥 Пацієнти</button>
              <Link to="/stats" className="menu-item highlight-item" style={{ textDecoration: 'none' }}>
                📊 Статистика
              </Link>
            </div>
          </aside>

          {/* КОНТЕНТ */}
          <main className="profile-content">
            <div className="page-header">
              <h1>Вітаємо, докторе {formData.lastName || "Користувач"}</h1>
              <p>Керуйте своїми даними та графіком прийомів</p>
            </div>

            <div className="profile-card glass-light profile-card-centered">
              <div className="avatar-section">
                <div className="avatar-wrapper gradient-ring doc-ring">
                  <div className="avatar-large">
                    <span className="avatar-initials">
                      {formData.firstName.charAt(0) || "D"}{formData.lastName.charAt(0) || "R"}
                    </span>
                  </div>
                </div>
                <div className="avatar-info">
                  <h2>{formData.firstName} {formData.lastName}</h2>
                  <span className="status-badge doc-badge">
                    {/* Шукаємо назву спеціалізації за ID, або показуємо заглушку */}
                    {specializations?.find((s: any) => s.id === formData.specializationId)?.name || "Спеціалізація не обрана"}
                  </span>
                </div>
              </div>

              {/* БЛОК РОЗКЛАДУ */}
              <div className="schedule-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Генерація розкладу</h3>
                  <button
                    type="button"
                    className="add-slot-btn"
                    onClick={() => setShowScheduleForm(!showScheduleForm)}
                  >
                    {showScheduleForm ? "✖ Закрити" : "📅 Створити графік"}
                  </button>
                </div>

                {showScheduleForm && (
                  <form onSubmit={handleScheduleSubmit} className="schedule-generator-form" style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.5)', borderRadius: '1rem' }}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Місяць</label>
                        <input type="number" min="1" max="12" value={scheduleData.month} onChange={(e) => setScheduleData({...scheduleData, month: Number(e.target.value)})} />
                      </div>
                      <div className="form-group">
                        <label>Рік</label>
                        <input type="number" min="2024" value={scheduleData.year} onChange={(e) => setScheduleData({...scheduleData, year: Number(e.target.value)})} />
                      </div>
                      <div className="form-group">
                        <label>Початок дня</label>
                        <input type="time" value={scheduleData.startTime} onChange={(e) => setScheduleData({...scheduleData, startTime: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Кінець дня</label>
                        <input type="time" value={scheduleData.endTime} onChange={(e) => setScheduleData({...scheduleData, endTime: e.target.value})} />
                      </div>
                    </div>
                    <button type="submit" disabled={isScheduling} className="save-btn" style={{ marginTop: '1rem', width: '100%' }}>
                      {isScheduling ? "Генерація..." : "Згенерувати слоти (Пн, Ср, Пт)"}
                    </button>
                  </form>
                )}
              </div>

              {/* БЛОК ПРОФІЛЮ */}
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group input-with-icon">
                    <label>Ім'я</label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-group input-with-icon">
                    <label>Прізвище</label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} required />
                    </div>
                  </div>

                  <div className="form-group input-with-icon" style={{ gridColumn: "1 / -1" }}>
                    <label>Спеціалізація</label>
                    <div className="input-wrapper">
                      <span className="input-icon">🩺</span>
                      <select
                        value={formData.specializationId}
                        onChange={(e) => setFormData({...formData, specializationId: e.target.value})}
                        style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', outline: 'none', background: 'rgba(255, 255, 255, 0.6)' }}
                        required
                      >
                        <option value="" disabled>Оберіть спеціалізацію...</option>
                        {isSpecsLoading ? (
                          <option>Завантаження...</option>
                        ) : (
                          specializations?.map((spec: any) => (
                            <option key={spec.id} value={spec.id}>{spec.name}</option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={isUpdating} className="save-btn glow-effect">
                    {isUpdating ? "Збереження..." : "Зберегти зміни"}
                  </button>
                </div>
              </form>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
