import React, { useEffect, useState, useRef } from "react";
import { usePatient } from "../../domains/users/usePatient/usePatient.ts";
import { useUpdatePatient } from "../../domains/users/useUpdatePatient/useUpdatePatient.ts";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // Рекомендується для виводу помилок валідації
import { User, Mail, Phone, Camera, Star, Loader2, UploadCloud, LogOut } from "lucide-react";
import "./PatientProfile.css";

const CURRENT_USER_ID = (localStorage.getItem("userId") || "").replace(/"/g, '');

export default function PatientProfile() {
  const navigate = useNavigate();
  const { data: patientResponse, isLoading, error } = usePatient(CURRENT_USER_ID);
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (patientResponse) {
      const rawName = patientResponse.fullName || "";
      const nameParts = rawName.trim().split(/\s+/);
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: patientResponse.email || "",
        phone: patientResponse.phone || "",
        avatarUrl: patientResponse.avatarUrl || "",
      });
    }
  }, [patientResponse]);

  // Валідація та завантаження фото
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ПЕРЕВІРКА: Тільки типи зображень
      if (!file.type.startsWith("image/")) {
        toast.error("Будь ласка, завантажте тільки файл зображення");
        return;
      }

      // Обмеження розміру (наприклад, 2МБ)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Файл занадто великий (макс. 2МБ)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // ВАЛІДАЦІЯ НОМЕРА ТЕЛЕФОНУ
    // Допускає формати: +380..., 0..., а також пробіли та дужки
    const phoneRegex = /^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}$/;

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error("Неправильний формат номера телефону");
      return;
    }

    updatePatient({
      fullName: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      avatarUrl: formData.avatarUrl,
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (isLoading) return (
    <div className="loading-screen">
      <div className="aero-loader"><div className="loader-ring"></div><div className="loader-core"></div></div>
    </div>
  );

  if (error || !CURRENT_USER_ID) return <div className="error-message">Не вдалося завантажити профіль</div>;

  return (
    <div className="aero-viewport light-theme profile-page" style={{ height: 'calc(100vh - 70px)', overflow: 'hidden' }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*" // Обмеження у вікні вибору файлу
        onChange={handleFileChange}
      />

      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
        <div className="light-blob blob-2"></div>
      </div>

      <div className="main-content" style={{ height: '100%' }}>
        <div className="layout-container" style={{ height: '100%', display: 'flex' }}>

          <aside className="sidebar">
            <div className="sidebar-menu glass-light">
              <button className="menu-item active">Особисті дані</button>
              <Link to="/gamification" className="menu-item highlight-item" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Star size={18} strokeWidth={2.5} /> Досягнення та Бали
              </Link>
            </div>
          </aside>

          <main className="profile-content" style={{ flex: 1, overflowY: 'auto', paddingBottom: '40px' }}>
            <div className="page-header">
              <h1>Особисті дані</h1>
              <p>Ваша інформація безпечно зашифрована</p>
            </div>

            <div className="profile-card glass-light profile-card-centered">
              <div className="avatar-section">
                <div className="avatar-wrapper gradient-ring" onClick={() => fileInputRef.current?.click()}>
                  <div className="avatar-large">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Avatar" />
                    ) : (
                      <span className="avatar-initials">
                        {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="avatar-overlay">
                    <Camera size={22} color="white" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="avatar-info">
                  <h2>{formData.firstName} {formData.lastName}</h2>
                  <span className="status-badge">Базовий акаунт</span>
                  <button type="button" className="change-photo-btn" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud size={16} style={{ marginRight: '8px' }} /> Оновити фото
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group input-with-icon">
                    <label>Ім'я</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={20} strokeWidth={2.5} />
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group input-with-icon">
                    <label>Прізвище</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={20} strokeWidth={2.5} />
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="form-group input-with-icon">
                    <label>Email адреса</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={20} strokeWidth={2.5} />
                      <input type="email" name="email" value={formData.email} disabled className="disabled-input" />
                    </div>
                  </div>
                  <div className="form-group input-with-icon">
                    <label>Номер телефону</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={20} strokeWidth={2.5} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+380..."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '20px' }}>
                  <button type="submit" disabled={isUpdating} className="save-btn glow-effect" style={{ flex: 1 }}>
                    {isUpdating ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Loader2 className="animate-spin" size={18} /> Збереження...
                      </div>
                    ) : "Зберегти зміни"}
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
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
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
