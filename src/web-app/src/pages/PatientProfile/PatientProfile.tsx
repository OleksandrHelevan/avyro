import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Phone, Camera, Star, Loader2, UploadCloud, LogOut, MapPin, Wallet } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth.tsx";
import { usePatient } from "../../domains/users/usePatient/usePatient.ts";
import { useUpdatePatient } from "../../domains/users/useUpdatePatient/useUpdatePatient.ts";
import Loader from "../../components/Loader/Loader.tsx";
import BadgeUnlockOverlay from "../GamificationPage/components/BadgeUnlockOverlay/BadgeUnlockOverlay.tsx";

import "./PatientProfile.css";
import WalletSidebarCard from "../BalanceSidebar/WalletSidebarCard.tsx";
import ProfileCompletionBanner from "../Profilecompletionbanner/Profilecompletionbanner.tsx";

export default function PatientProfile() {
  const navigate = useNavigate();
  const { userId, logout } = useAuth();

  const { data: patientResponse, isLoading, error } = usePatient(userId || "");
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [badgeUnlock, setBadgeUnlock] = useState<{ source: string; points: number } | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (patientResponse) {
      const rawName = patientResponse.fullName || "";
      const nameParts = rawName.trim().split(/\s+/);

      const first = nameParts[0] || "";
      const last = nameParts.slice(1).join(" ") || "";

      setFormData({
        firstName: first,
        lastName: last,
        email: patientResponse.email || "",
        phone: patientResponse.phone || "",
        address: patientResponse.address || "",
        avatarUrl: patientResponse.avatarUrl || "",
      });
    }
  }, [patientResponse]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Будь ласка, завантажте тільки файл зображення");
        return;
      }
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
    const phoneRegex = /^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}$/;

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error("Неправильний формат номера телефону");
      return;
    }

    const hadRewardBefore = patientResponse?.rewards?.some(
      (r: any) => r.source === "PROFILE_BONUS"
    );

    const wasFullyFilledBefore = !!(
      patientResponse?.fullName?.trim() &&
      patientResponse?.phone?.trim() &&
      patientResponse?.address?.trim() &&
      patientResponse?.avatarUrl?.trim()
    );

    const isFullyFilledNow = !!(
      formData.firstName.trim() &&
      formData.lastName.trim() &&
      formData.phone.trim() &&
      formData.address.trim() &&
      formData.avatarUrl.trim()
    );

    updatePatient(
      {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
        address: formData.address,
      },
      {
        onSuccess: (response) => {
          if (!hadRewardBefore && !wasFullyFilledBefore && isFullyFilledNow) {
            const profileReward = response?.rewards?.find(
              (r: any) => r.source === "PROFILE_BONUS"
            );
            setBadgeUnlock({
              source: "PROFILE_BONUS",
              points: profileReward?.points || 100,
            });
          } else {
            toast.success("Профіль оновлено!");
          }
        },
      }
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) return <div className="loading-screen"><Loader /></div>;
  if (error || !userId) return <div className="error-message">Не вдалося завантажити профіль</div>;

  return (
    <div className="aero-viewport light-theme profile-page" style={{ height: "calc(100vh - 70px)", overflow: "hidden" }}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />

      {badgeUnlock && (
        <BadgeUnlockOverlay
          source={badgeUnlock.source}
          points={badgeUnlock.points}
          onClose={() => setBadgeUnlock(null)}
        />
      )}

      <div className="main-content" style={{ height: "100%", position: "relative", zIndex: 1 }}>
        <div className="layout-container" style={{ height: "100%", display: "flex" }}>

          {/* ── Sidebar ── */}
          <aside className="sidebar">
            <div className="sidebar-menu glass-light slide-in-left">
              <button className="menu-item active">
                <User size={18} /> Особисті дані
              </button>
              <Link to="/gamification" className="menu-item" style={{ textDecoration: "none", color: "inherit" }}>
                <Star size={18} strokeWidth={2.5} /> Досягнення та Бали
              </Link>
              <Link to="/wallet" className="menu-item" style={{ textDecoration: "none", color: "inherit" }}>
                <Wallet size={18} /> Баланс
              </Link>
              <WalletSidebarCard />
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="profile-content" style={{ flex: 1, overflowY: "auto", paddingBottom: "40px" }}>

            {/* ── Profile completion banner ── */}
            <ProfileCompletionBanner
              profile={{
                firstName: formData.firstName,
                lastName:  formData.lastName,
                phone:     formData.phone,
                address:   formData.address,
                avatarUrl: formData.avatarUrl,
              }}
            />

            <div className="page-header">
              <h1>Особисті дані</h1>
              <p>Ваша інформація безпечно зашифрована</p>
            </div>

            <div className="profile-card glass-light profile-card-centered">
              {/* ── Avatar section ── */}
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
                    <UploadCloud size={16} style={{ marginRight: "8px" }} /> Оновити фото
                  </button>
                </div>
              </div>

              {/* ── Form ── */}
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

                  <div className="form-group input-with-icon">
                    <label>Адреса</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={20} strokeWidth={2.5} />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Місто, вулиця, будинок..."
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions" style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "20px" }}>
                  <button type="submit" disabled={isUpdating} className="save-btn glow-effect" style={{ flex: 1 }}>
                    {isUpdating ? (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                        <Loader2 className="animate-spin" size={18} /> Збереження...
                      </div>
                    ) : "Зберегти зміни"}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="logout-btn-custom"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 24px",
                      backgroundColor: "#fff1f2",
                      color: "#e11d48",
                      border: "1px solid #fda4af",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
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
