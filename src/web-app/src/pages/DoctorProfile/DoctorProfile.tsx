import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Stethoscope,
  Calendar as CalendarIcon,
  UserCircle,
  LayoutDashboard,
  LogOut
} from "lucide-react";

import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import { useSpecializations } from "../../domains/specializations/useSpecializations/useSpecializations";
import { useUpdateDoctor } from "../../domains/users/useUpdateDoctor/useUpdateDoctor";
import { useAuth } from "../../AuthContext.tsx";

import "./DoctorProfile.css";

export default function DoctorProfile() {
  const navigate = useNavigate();

  // Беремо дані користувача та централізований логаут з нашого реактивного контексту
  const { userId, logout } = useAuth();

  // 1. Отримуємо дані доктора та список спеціалізацій за допомогою ID з контексту
  const { data: doctor, isLoading: isDoctorLoading } = useDoctor(userId || "");
  const { data: specializations, isLoading: isSpecsLoading } = useSpecializations();

  // 2. Хук оновлення даних лікаря
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specializationId: "",
    phone: "",
    avatarUrl: "",
  });

  // 3. Синхронізація стану форми з даними з API
  useEffect(() => {
    if (doctor && specializations) {
      const doc = doctor as any;

      // Розбираємо повне ім'я на Ім'я та Прізвище
      const rawName = doc.fullName || doc.full_name || "";
      const nameParts = rawName.trim().split(/\s+/);
      const first = nameParts[0] || "";
      const last = nameParts.slice(1).join(" ") || "";

      // Перевіряємо наявність ID спеціалізації безпосередньо в об'єкті лікаря
      let specId = doc.specializationId || doc.specialization_id || "";

      // ✅ СТАНЕ (Приводимо foundSpec до типу any):
      if (!specId && doc.specializationName) {
        const foundSpec = specializations.find((s: any) => s.name === doc.specializationName);
        if (foundSpec) {
          specId = (foundSpec as any)._id || (foundSpec as any).id || "";
        }
      }

      setFormData({
        firstName: first,
        lastName: last,
        specializationId: specId,
        phone: doc.phone || "",
        avatarUrl: doc.avatarUrl || "",
      });
    }
  }, [doctor, specializations]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Помилка: ID користувача не знайдено");
      return;
    }

    // ✅ ВИПРАВЛЕНО: Додаємо знак "!" після userId, щоб TS не сварився на null
    updateDoctor({
      data: {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        specialization_id: formData.specializationId,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
      } as any
    });
  };

  // Викликаємо реактивний вихід із системи через Context API
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isDoctorLoading) return <div className="loading-screen"><span className="spinner">⏳</span></div>;

  return (
    <div className="aero-viewport light-theme profile-page doctor-theme">
      {/* ФОНОВИЙ ДЕКОР */}
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1" style={{ background: 'rgba(59, 206, 181, 0.3)' }}></div>
        <div className="light-blob blob-2" style={{ background: 'rgba(59, 130, 246, 0.3)' }}></div>
      </div>

      {/* Плаваючі іконки на задньому плані */}
      <div className="floating-icons-container">
        <div className="floating-icon icon-1">🩺</div>
        <div className="floating-icon icon-2">✨</div>
        <div className="floating-icon icon-3">💙</div>
      </div>

      <div className="main-content">
        <div className="layout-container">
          <aside className="sidebar">
            <div className="sidebar-menu glass-light">
              <button className="menu-item active">
                <LayoutDashboard size={18} />
                <span>Кабінет лікаря</span>
              </button>
            </div>
          </aside>

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

              <div className="schedule-redirect-card">
                <div className="redirect-info">
                  <h3>Генерація розкладу</h3>
                  <p>Налаштуйте робочі години та тривалість прийомів</p>
                </div>
                <button
                  type="button"
                  className="btn-redirect-schedule"
                  onClick={() => navigate("/schedule-edit")}
                >
                  <CalendarIcon size={20} strokeWidth={2.5} />
                  <span>Мій графік</span>
                </button>
              </div>

              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Ім'я</label>
                    <div className="input-wrapper">
                      <UserCircle className="input-icon-svg" size={18} />
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
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
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                        onChange={(e) => setFormData({ ...formData, specializationId: e.target.value })}
                        className="custom-select"
                        required
                      >
                        <option value="" disabled>Оберіть напрямок...</option>
                        {!isSpecsLoading && specializations?.map((spec: any) => (
                          <option key={spec.id || spec._id} value={spec.id || spec._id}>
                            {spec.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                  <button type="submit" disabled={isUpdating} className="save-btn glow-effect" style={{ flex: 1 }}>
                    {isUpdating ? "Збереження..." : "Зберегти зміни"}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="logout-btn-custom"
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
                      fontWeight: '600'
                    }}
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
