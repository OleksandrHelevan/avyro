import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Stethoscope,
  UserCircle,
  LayoutDashboard,
  LogOut, Wallet, PlusCircle, Check
} from "lucide-react";

import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import { useSpecializations } from "../../domains/specializations/useSpecializations/useSpecializations";
import { useUpdateDoctor } from "../../domains/users/useUpdateDoctor/useUpdateDoctor";
import { useAuth } from "../../context/auth/useAuth.tsx";
import { useCreateSpecialization } from "../../domains/specializations/useCreateSpecialization/useCreateSpecialization.ts"; // 🚀 ДОДАНО ХУК

import ScheduleRedirectCard from "./components/ScheduleRedirectCard/ScheduleRedirectCard.tsx";
import Loader from "../../components/Loader/Loader.tsx";
import SelectInput from "../../components/SelectInput/SelectInput.tsx";

import "./DoctorProfile.css";
import WalletSidebarCard from "../BalanceSidebar/WalletSidebarCard.tsx";

export default function DoctorProfile() {
  const navigate = useNavigate();
  const { userId, logout } = useAuth();

  const { data: doctor, isLoading: isDoctorLoading } = useDoctor(userId || "");
  const { data: specializations, isLoading: isSpecsLoading } = useSpecializations();
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();
  const { mutate: createSpecialization, isPending: isCreatingSpec } = useCreateSpecialization();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specializationId: "",
    phone: "",
    avatarUrl: "",
  });

  // 🚀 Стейт для нової спеціалізації
  const [showNewSpecForm, setShowNewSpecForm] = useState(false);
  const [newSpecName, setNewSpecName] = useState("");

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

  const handleCreateSpec = () => {
    if (!newSpecName.trim()) {
      toast.error("Введіть назву спеціалізації");
      return;
    }

    createSpecialization(
      { name: newSpecName },
      {
        onSuccess: () => {
          toast.success("Спеціалізацію запропоновано!");
          setNewSpecName("");
          setShowNewSpecForm(false);
        }
      }
    );
  };

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

            <button
              className="menu-item"
              onClick={() => navigate("/wallet")}
            >
              <Wallet size={18}/>
              <span>Баланс</span>
            </button>

            <WalletSidebarCard/>
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

                  {/* 🚀 ДОДАНО: Кнопка для відкриття форми нової спеціалізації */}
                  {!showNewSpecForm ? (
                    <button
                      type="button"
                      onClick={() => setShowNewSpecForm(true)}
                      style={{
                        background: 'none', border: 'none', color: '#7b51b3',
                        fontSize: '13px', fontWeight: '600', display: 'flex',
                        alignItems: 'center', gap: '4px', marginTop: '8px',
                        cursor: 'pointer', padding: 0
                      }}
                    >
                      <PlusCircle size={14} /> Не знайшли свою спеціалізацію?
                    </button>
                  ) : (
                    <div style={{
                      marginTop: '12px', padding: '16px', background: '#f8fafc',
                      borderRadius: '12px', border: '1px dashed #cbd5e1'
                    }}>
                      <label style={{ fontSize: '13px', color: '#475569', marginBottom: '8px', display: 'block' }}>
                        Запропонуйте нову спеціалізацію:
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          value={newSpecName}
                          onChange={(e) => setNewSpecName(e.target.value)}
                          placeholder="Введіть назву..."
                          style={{
                            flex: 1, padding: '10px 14px', borderRadius: '8px',
                            border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleCreateSpec}
                          disabled={isCreatingSpec}
                          style={{
                            background: '#7b51b3', color: 'white', border: 'none',
                            borderRadius: '8px', padding: '0 16px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600'
                          }}
                        >
                          {isCreatingSpec ? "..." : <><Check size={16} /> Додати</>}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setShowNewSpecForm(false); setNewSpecName(""); }}
                          style={{
                            background: 'white', color: '#64748b', border: '1px solid #e2e8f0',
                            borderRadius: '8px', padding: '0 12px', cursor: 'pointer', fontWeight: '600'
                          }}
                        >
                          Скасувати
                        </button>
                      </div>
                    </div>
                  )}
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
