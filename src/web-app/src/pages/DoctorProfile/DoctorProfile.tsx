import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import toast from "react-hot-toast";
import {
  Stethoscope,
  UserCircle,
  LayoutDashboard,
  LogOut
} from "lucide-react";

import {useDoctor} from "../../domains/users/useDoctor/useDoctor";
import {useSpecializations} from "../../domains/specializations/useSpecializations/useSpecializations";
import {useUpdateDoctor} from "../../domains/users/useUpdateDoctor/useUpdateDoctor";
import {useAuth} from "../../context/auth/useAuth.tsx";
import ScheduleRedirectCard from "./components/ScheduleRedirectCard/ScheduleRedirectCard.tsx";
import Loader from "../../components/Loader/Loader.tsx";
import SelectInput from "../../components/SelectInput/SelectInput.tsx"; // Імпорт твого компонента

import "./DoctorProfile.css";

export default function DoctorProfile() {
  const navigate = useNavigate();
  const {userId, logout} = useAuth();

  const {data: doctor, isLoading: isDoctorLoading} = useDoctor(userId || "");
  const {data: specializations, isLoading: isSpecsLoading} = useSpecializations();
  const {mutate: updateDoctor, isPending: isUpdating} = useUpdateDoctor();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specializationId: "",
    phone: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (doctor && specializations) {
      const doc = doctor as any;

      const rawName = doc.fullName || doc.full_name || "";
      const nameParts = rawName.trim().split(/\s+/);
      const first = nameParts[0] || "";
      const last = nameParts.slice(1).join(" ") || "";

      let specId = doc.specializationId || doc.specialization_id || "";

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

    updateDoctor({
      data: {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        specialization_id: formData.specializationId,
        phone: formData.phone,
        avatarUrl: formData.avatarUrl,
      } as any
    });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Підготовка опцій для SelectInput
  const specializationOptions = specializations?.map((spec: any) => ({
    value: spec.id || spec._id,
    label: spec.name,
  })) || [];

  if (isDoctorLoading && isSpecsLoading) return <div className={"loading-screen"}><Loader/></div>;

  return (
    <div className="main-content">
      <div className="layout-container">
        <aside className="sidebar">
          <div className="sidebar-menu glass-light">
            <button className="menu-item active">
              <LayoutDashboard size={18}/>
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

            <ScheduleRedirectCard/>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Ім'я</label>
                  <div className="input-wrapper">
                    <UserCircle className="input-icon-svg" size={18}/>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Прізвище</label>
                  <div className="input-wrapper">
                    <UserCircle className="input-icon-svg" size={18}/>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{gridColumn: "1 / -1"}}>
                  <SelectInput
                    label="Спеціалізація"
                    placeholder="Оберіть напрямок..."
                    icon={<Stethoscope size={18}/>}
                    options={specializationOptions}
                    value={formData.specializationId}
                    onChange={(val) => setFormData({...formData, specializationId: val.toString()})}
                  />
                </div>
              </div>

              <div className="form-actions" style={{display: 'flex', gap: '16px', marginTop: '20px'}}>
                <button type="submit" disabled={isUpdating} className="save-btn glow-effect" style={{flex: 1}}>
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
                  <LogOut size={18} strokeWidth={2.5}/>
                  Вийти
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
