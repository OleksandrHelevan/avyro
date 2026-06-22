import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User, Mail, Phone, Camera, Loader2, UploadCloud, LogOut, MapPin } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth.tsx";
import { usePatient } from "../../domains/users/usePatient/usePatient.ts";
import { useUpdatePatient } from "../../domains/users/useUpdatePatient/useUpdatePatient.ts";
import Loader from "../../components/Loader/Loader.tsx";
import BadgeUnlockOverlay from "../GamificationPage/components/BadgeUnlockOverlay/BadgeUnlockOverlay.tsx";
import ProfileCompletionBanner from "../ProfileCompletionBanner/ProfileCompletionBanner.tsx";
import PatientSidebar from "../../components/PatientSidebar/PatientSidebar.tsx";
import "./PatientProfile.css";

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
      setFormData({
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        email: patientResponse.email || "",
        phone: patientResponse.phone || "",
        address: patientResponse.address || "",
        avatarUrl: patientResponse.avatarUrl || "",
      });
    }
  }, [patientResponse]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Лише зображення");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Файл до 2МБ");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneRegex = /^(\+?\d{1,3})?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2}$/;

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      toast.error("Неправильний формат телефону");
      return;
    }

    const hadRewardBefore = patientResponse?.rewards?.some((r: any) => r.source === "PROFILE_BONUS");
    const wasFullyFilledBefore = !!(patientResponse?.fullName?.trim() && patientResponse?.phone?.trim() && patientResponse?.address?.trim() && patientResponse?.avatarUrl?.trim());
    const isFullyFilledNow = !!(formData.firstName.trim() && formData.lastName.trim() && formData.phone.trim() && formData.address.trim() && formData.avatarUrl.trim());

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
            setBadgeUnlock({ source: "PROFILE_BONUS", points: response?.rewards?.find((r: any) => r.source === "PROFILE_BONUS")?.points || 100 });
          } else {
            toast.success("Профіль оновлено!");
          }
        },
      }
    );
  };

  if (isLoading) return <div className="loading-screen"><Loader /></div>;
  if (error || !userId) return <div className="error-message">Помилка завантаження профілю</div>;

  return (
    <div className="aero-viewport light-theme profile-page">
      <input type="file" ref={fileInputRef} style={{ display: "none" }} accept="image/*" onChange={handleFileChange} aria-hidden="true" />

      {badgeUnlock && (
        <BadgeUnlockOverlay source={badgeUnlock.source} points={badgeUnlock.points} onClose={() => setBadgeUnlock(null)} />
      )}

      <div className="main-content">
        <div className="layout-container">
          <PatientSidebar />

          <main className="profile-content">
            <ProfileCompletionBanner profile={formData} />

            <header className="page-header">
              <h1>Особисті дані</h1>
              <p>Ваша інформація безпечно зашифрована</p>
            </header>

            <section className="profile-card glass-light profile-card-centered">
              <div className="avatar-section">
                <button type="button" className="avatar-wrapper gradient-ring" onClick={() => fileInputRef.current?.click()} aria-label="Змінити фото">
                  <div className="avatar-large">
                    {formData.avatarUrl ? (
                      <img src={formData.avatarUrl} alt="Аватар" loading="lazy" width="128" height="128" />
                    ) : (
                      <span className="avatar-initials">{formData.firstName.charAt(0)}{formData.lastName.charAt(0)}</span>
                    )}
                  </div>
                  <div className="avatar-overlay"><Camera size={22} color="white" /></div>
                </button>
                <div className="avatar-info">
                  <h2>{formData.firstName} {formData.lastName}</h2>
                  <button type="button" className="change-photo-btn" onClick={() => fileInputRef.current?.click()}>
                    <UploadCloud size={16} /> Оновити фото
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group input-with-icon">
                    <label htmlFor="firstName">Ім'я</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={20} />
                      <input id="firstName" type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="form-group input-with-icon">
                    <label htmlFor="lastName">Прізвище</label>
                    <div className="input-wrapper">
                      <User className="input-icon" size={20} />
                      <input id="lastName" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </div>
                  </div>

                  <div className="form-group input-with-icon">
                    <label htmlFor="email">Email адреса</label>
                    <div className="input-wrapper">
                      <Mail className="input-icon" size={20} />
                      <input id="email" type="email" value={formData.email} disabled className="disabled-input" />
                    </div>
                  </div>

                  <div className="form-group input-with-icon">
                    <label htmlFor="phone">Номер телефону</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={20} />
                      <input id="phone" type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+380..." />
                    </div>
                  </div>

                  <div className="form-group input-with-icon">
                    <label htmlFor="address">Адреса</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={20} />
                      <input id="address" type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Місто, вулиця..." />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" disabled={isUpdating} className="save-btn glow-effect">
                    {isUpdating ? <Loader2 className="animate-spin" size={18} /> : "Зберегти зміни"}
                  </button>
                  <button type="button" onClick={() => { logout(); navigate("/login"); }} className="logout-btn-custom">
                    <LogOut size={18} /> Вийти
                  </button>
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
