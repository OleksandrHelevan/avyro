import React, { useState } from "react";
import { Plus, Check, X, Loader2, Tag, Info } from "lucide-react";
import toast from "react-hot-toast";

import "./AdminNotifications.css";
import {
  useApproveSpecialization,
  useCreateSpecializationDirect
} from "../../domains/users/useSpecializationMutations/useSpecializationMutations.ts";
import {useAdminSpecializations} from "../../domains/users/useAdminSpecializations/useAdminSpecializations.ts";
import {useRejectSchedule} from "../../domains/users/useRejectSchedule/useRejectSchedule.ts"; // Використовуємо ті ж самі стилі для сітки карток

export default function AdminSpecializations() {
  const [newSpecName, setNewSpecName] = useState("");

  // Queries & Mutations
  const { data: requests, isLoading, isError } = useAdminSpecializations();
  const { mutate: createDirect, isPending: isCreating } = useCreateSpecializationDirect();
  const { mutate: approveSpec, isPending: isApproving } = useApproveSpecialization();
  const { mutate: rejectReq, isPending: isRejecting } = useRejectSchedule();

  // Обробка прямого створення
  const handleDirectCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName.trim()) {
      toast.error("Введіть назву спеціалізації");
      return;
    }
    createDirect({ name: newSpecName.trim() }, {
      onSuccess: () => setNewSpecName("") // Очищаємо поле після успіху
    });
  };

  // Обробка відхилення запиту
  const handleRejectClick = (requestId: string) => {
    const comment = window.prompt("Вкажіть причину відхилення:");
    if (comment !== null) {
      if (comment.trim() === "") return toast.error("Причина є обов'язковою!");
      rejectReq({ scheduleId: requestId, comment: comment.trim() }); // В хуку параметр називається scheduleId, але він працює як універсальний requestId
    }
  };

  if (isLoading) return <div className="dash-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: '100px' }}><Loader2 className="animate-spin" size={40} color="#4f46e5" /></div>;
  if (isError) return <div className="dash-page"><h2 style={{ color: '#ef4444' }}>Помилка завантаження даних</h2></div>;

  const pendingRequests = requests?.filter((r: any) => r.status === "PENDING") || [];

  return (
    <div className="dash-page">
      <h2>Управління спеціалізаціями</h2>

      {/* БЛОК ПРЯМОГО СТВОРЕННЯ */}
      <div className="dash-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
          <Tag size={20} className="text-indigo-600" />
          Створити нову спеціалізацію вручну
        </h3>
        <form onSubmit={handleDirectCreate} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Наприклад: Нейрохірург"
            value={newSpecName}
            onChange={(e) => setNewSpecName(e.target.value)}
            style={{
              flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            disabled={isCreating}
            style={{
              padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: isCreating ? 'not-allowed' : 'pointer',
              opacity: isCreating ? 0.7 : 1
            }}
          >
            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Створити
          </button>
        </form>
      </div>

      {/* БЛОК ЗАПИТІВ ВІД ЛІКАРІВ */}
      <h3 style={{ color: '#334155', marginBottom: '1rem' }}>Запити від лікарів ({pendingRequests.length})</h3>

      {pendingRequests.length === 0 ? (
        <p style={{ color: '#64748b' }}>Немає нових запитів на додавання спеціалізацій.</p>
      ) : (
        <div className="dash-grid">
          {pendingRequests.map((req: any) => {
            const data = req.payload || req; // Дістаємо дані
            const specName = data.name || data.specializationName || "?";
            const isBusy = isApproving || isRejecting;

            return (
              <div className="dash-card" key={req._id || req.id}>
                <div className="dash-header">
                  <div>
                    <h3>{specName}</h3>
                    <span style={{ color: '#94a3b8' }}>Нова спеціалізація</span>
                  </div>
                  <Info size={24} color="#94a3b8" />
                </div>

                <div className="dash-metrics" style={{ padding: '1.5rem' }}>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.9rem' }}>
                    Лікар хоче додати спеціалізацію <strong>"{specName}"</strong>, якої наразі немає в системі.
                  </p>
                </div>

                <div className="dash-actions" style={{ display: 'flex', gap: '10px', padding: '0 1.5rem 1.5rem' }}>
                  <button
                    className="dash-btn"
                    style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                    onClick={() => approveSpec(req._id || req.id)}
                    disabled={isBusy}
                  >
                    <Check size={18}/> Прийняти
                  </button>

                  <button
                    className="dash-btn"
                    style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                    onClick={() => handleRejectClick(req._id || req.id)}
                    disabled={isBusy}
                  >
                    <X size={18}/> Відхилити
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
