import React, { useState } from "react";
import { Plus, Check, X, Loader2, Tag, Info } from "lucide-react";
import toast from "react-hot-toast";

import "./AdminNotifications.css";
import {
  useApproveSpecialization,
  useCreateSpecializationDirect
} from "../../domains/users/useSpecializationMutations/useSpecializationMutations.ts";
import { useAdminSpecializations } from "../../domains/users/useAdminSpecializations/useAdminSpecializations.ts";
import { useRejectSchedule } from "../../domains/users/useRejectSchedule/useRejectSchedule.ts";

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
      rejectReq({ scheduleId: requestId, comment: comment.trim() });
    }
  };

  if (isLoading) {
    return (
      <div className="loader-container">
        <Loader2 className="animate-spin" size={40} color="#4f46e5" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="dash-page">
        <h2 style={{ color: '#ef4444' }}>Помилка завантаження даних</h2>
      </div>
    );
  }

  const pendingRequests = requests?.filter((r: any) => r.status === "PENDING") || [];

  return (
    <div className="dash-page">
      <h2 className="dash-page-title">Управління спеціалізаціями</h2>

      {/* БЛОК ПРЯМОГО СТВОРЕННЯ */}
      <div className="create-card">
        <h3 className="create-card-title">
          <Tag size={20} color="#4f46e5" />
          Створити нову спеціалізацію вручну
        </h3>

        <form onSubmit={handleDirectCreate} className="create-form">
          <input
            type="text"
            className="create-input"
            placeholder="Наприклад: Нейрохірург"
            value={newSpecName}
            onChange={(e) => setNewSpecName(e.target.value)}
          />
          <button
            type="submit"
            className="create-btn"
            disabled={isCreating}
          >
            {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Створити
          </button>
        </form>
      </div>

      {/* БЛОК ЗАПИТІВ ВІД ЛІКАРІВ */}
      <h3 className="section-title">Запити від лікарів ({pendingRequests.length})</h3>

      {pendingRequests.length === 0 ? (
        <div className="empty-state">
          Немає нових запитів на додавання спеціалізацій.
        </div>
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
                    <span>Нова спеціалізація</span>
                  </div>
                  <Info size={24} color="#94a3b8" />
                </div>

                <div className="dash-metrics">
                  <p>
                    Лікар хоче додати спеціалізацію <strong>"{specName}"</strong>, якої наразі немає в системі.
                  </p>
                </div>

                <div className="dash-actions">
                  <button
                    className="dash-btn btn-approve"
                    onClick={() => approveSpec(req._id || req.id)}
                    disabled={isBusy}
                  >
                    <Check size={18} /> Прийняти
                  </button>

                  <button
                    className="dash-btn btn-reject"
                    onClick={() => handleRejectClick(req._id || req.id)}
                    disabled={isBusy}
                  >
                    <X size={18} /> Відхилити
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
