import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Stethoscope,
  Calendar as CalendarIcon,
  UserCircle,
  LayoutDashboard,
  LogOut // Додано імпорт іконки LogOut
} from "lucide-react";

// Прямі імпорти ваших хуків
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import { useSpecializations } from "../../domains/users/useSpecializations/useSpecializations";
import { useUpdateDoctor } from "../../domains/users/useUpdateDoctor/useUpdateDoctor";

import "./DoctorProfile.css";

const CURRENT_USER_ID = (localStorage.getItem("userId") || "").replace(/"/g, '');

export default function DoctorProfile() {
  const navigate = useNavigate();

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

  // Функція виходу
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
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
              <button className="menu-item active">
                <LayoutDashboard size={18} />
                <span>Кабінет лікаря</span>
              </button>
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
                  <div className="form-group">
                    <label>Ім'я</label>
                    <div className="input-wrapper">
                      <UserCircle className="input-icon-svg" size={18} />
                      <input
                        type="text"
                        placeholder="Ваше ім'я"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Прізвище</label>
                    <div className="input-wrapper">
                      <UserCircle className="input-icon-svg" size={18} />
                      <input
                        type="text"
                        placeholder="Ваше прізвище"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label>Спеціалізація</label>
                    <div className="input-wrapper">
                      <Stethoscope className="input-icon-svg" size={18} />
                      <select
                        value={formData.specializationId}
                        onChange={(e) => setFormData({...formData, specializationId: e.target.value})}
                        className="custom-select"
                        required
                      >
                        <option value="" disabled>Оберіть напрямок діяльності...</option>
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

                {/* ОНОВЛЕНИЙ БЛОК КНОПОК */}
                <div className="form-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '20px' }}>
                  <button type="submit" disabled={isUpdating} className="save-btn glow-effect" style={{ flex: 1 }}>
                    {isUpdating ? "Збереження..." : "Зберегти зміни"}
                  </button>

                  {/* Нова кнопка логауту */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      backgroundColor: '#fff1f2',
                      color: '#e11d48',
                      border: '1px solid #fda4af',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ffe4e6'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff1f2'}
                  >
                    <LogOut size={18} strokeWidth={2.5} />
                    Вийти
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
