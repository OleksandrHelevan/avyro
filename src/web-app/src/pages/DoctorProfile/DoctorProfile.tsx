import React, { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom"; // Додано useNavigate
import toast from "react-hot-toast";
import {  Calendar as CalendarIcon } from "lucide-react"; // Додано іконки

// Прямі імпорти ваших хуків
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import { useSpecializations } from "../../domains/users/useSpecializations/useSpecializations";
import { useUpdateDoctor } from "../../domains/users/useUpdateDoctor/useUpdateDoctor";

import "./DoctorProfile.css";

const CURRENT_USER_ID = (localStorage.getItem("userId") || "").replace(/"/g, '');

export default function DoctorProfile() {
  const navigate = useNavigate(); // Ініціалізація навігації

  // --- ХУКИ ---
  const { data: doctor, isLoading: isDoctorLoading } = useDoctor(CURRENT_USER_ID);
  const { data: specializations, isLoading: isSpecsLoading } = useSpecializations();
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specializationId: "",
    phone: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (doctor) {
      const rawName = (doctor as any).fullName || (doctor as any).full_name || "";
      const nameParts = rawName.trim().split(/\s+/);
      const first = nameParts[0] || "";
      const last = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: first,
        lastName: last,
        specializationId: (doctor as any).specializationId || (doctor as any).specialization_id || "",
        phone: (doctor as any).phone || "",
        avatarUrl: (doctor as any).avatarUrl || "",
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
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
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
                    {specializations?.find((s: any) => (s.id === formData.specializationId || s._id === formData.specializationId))?.name || "Спеціалізація не обрана"}
                  </span>
                  </div>
                </div>

                {/* БЛОК ПЕРЕХОДУ ДО РОЗКЛАДУ */}
                <div className="schedule-redirect-card">
                  <div className="redirect-info">
                    <h3>Генерація розкладу</h3>
                    <p>Налаштуйте робочі години та тривалість прийомів на окремій сторінці</p>
                  </div>
                  <button
                      type="button"
                      className="btn-redirect-schedule"
                      onClick={() => navigate("/schedule-edit")}
                  >
                    <CalendarIcon size={20} strokeWidth={2.5}/>
                    <span>Створити графік</span>
                  </button>
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
                                  <option key={spec.id || spec._id} value={spec.id || spec._id}>{spec.name}</option>
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
