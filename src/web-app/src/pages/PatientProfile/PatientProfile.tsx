import React, { useEffect, useState } from "react";
import { usePatient } from "../../domains/users/usePatient/usePatient.ts";
import { useUpdatePatient } from "../../domains/users/useUpdatePatient/useUpdatePatient.ts";
import { Link } from "react-router-dom";
import "./PatientProfile.css";

const CURRENT_USER_ID = (localStorage.getItem("userId") || "mock-id-123").replace(/"/g, '');

export default function PatientProfile() {
  const { data: patientResponse, isLoading, error } = usePatient(CURRENT_USER_ID);
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (patientResponse) {
      const rawName = patientResponse.fullName || (patientResponse as any).name || "";
      const nameParts = rawName.trim().split(/\s+/);
      const first = nameParts[0] || "";
      const last = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: first,
        lastName: last,
        email: patientResponse.email || "",
        phone: patientResponse.phone || "",
        avatarUrl: patientResponse.avatarUrl || "",
      });
    }
  }, [patientResponse]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient({
      id: CURRENT_USER_ID,
      patientData: {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
      },
    });
  };

  if (isLoading) return <div className="loading-screen"><span className="spinner">⏳</span></div>;
  if (error) return <div className="error-message">Не вдалося завантажити профіль</div>;

  return (
    <div className="aero-viewport light-theme profile-page">

      {/* ФОН З ГОЛОВНОЇ СТОРІНКИ */}
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
        <div className="light-blob blob-2"></div>
      </div>

      {/* ПЛАВАЮЧІ ІКОНКИ */}
      <div className="floating-icons-container">
        <div className="bg-icon icon-heart"></div>
        <div className="bg-icon icon-cross"></div>
        <div className="bg-icon icon-pill"></div>
        <div className="bg-icon icon-heart2"></div>
        <div className="bg-icon icon-plus"></div>
      </div>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <div className="main-content">
        <div className="layout-container">

          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-menu glass-light">
              <button className="menu-item active">Особисті дані</button>
              <Link to="/gamification" className="menu-item highlight-item" style={{ textDecoration: 'none', display: 'block' }}>
                🌟 Досягнення та Бали
              </Link>
            </div>
          </aside>

          {/* CONTENT */}
          <main className="profile-content">
            <div className="page-header">
              <h1>Особисті дані</h1>
              <p>Ваша інформація безпечно зашифрована</p>
            </div>

            <div className="profile-card glass-light profile-card-centered">
              <div className="avatar-section">
                <div className="avatar-wrapper gradient-ring">
                  <div className="avatar-large">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" />
                    ) : (
                      <span className="avatar-initials">
                        {formData.firstName.charAt(0) || "P"}{formData.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="avatar-overlay"><span>📷</span></div>
                </div>
                <div className="avatar-info">
                  <h2>{formData.firstName || "Новий"} {formData.lastName || "Користувач"}</h2>
                  <span className="status-badge">Базовий акаунт</span>
                  <button type="button" className="change-photo-btn">Оновити фото</button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group input-with-icon">
                    <label>Ім'я</label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group input-with-icon">
                    <label>Прізвище</label>
                    <div className="input-wrapper">
                      <span className="input-icon">👤</span>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group input-with-icon">
                    <label>Email адреса</label>
                    <div className="input-wrapper">
                      <span className="input-icon">✉️</span>
                      <input type="email" name="email" value={formData.email} disabled className="disabled-input" />
                    </div>
                  </div>
                  <div className="form-group input-with-icon">
                    <label>Номер телефону</label>
                    <div className="input-wrapper">
                      <span className="input-icon">📞</span>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+380..." />
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
