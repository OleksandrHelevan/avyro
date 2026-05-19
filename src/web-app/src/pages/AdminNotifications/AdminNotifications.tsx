import { Plus, Loader2, Tag, Check, X, Clock } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import "./AdminNotifications.css";
import TextInput from "../../components/TextInput/TextInput";

// Твій хук для прямого створення
import { useCreateSpecializationDirect } from "../../domains/admin/useSpecializationMutations/useSpecializationMutations.ts";
import {adminService} from "../../domains/admin/service/adminService.ts";

// 🚀 ДОДАНО: Імпорт твого сервісу адмінки (ПЕРЕВІР ШЛЯХ ДО ФАЙЛУ!)
// В ньому мають бути методи getAdminSpecializations, approveSpecialization, rejectRegistration (або rejectRequest)

export default function AdminSpecializations() {
  const queryClient = useQueryClient();

  const methods = useForm({
    defaultValues: {
      specName: "",
    },
  });

  // 1. Мутація: Пряме створення спеціалізації адміном
  const { mutate: createDirect, isPending: isCreating } = useCreateSpecializationDirect();

  // 2. Запит: Отримання запропонованих спеціалізацій
  const { data: proposedRequests, isLoading: isFetching } = useQuery({
    queryKey: ["adminSpecializations"],
    queryFn: () => adminService.getAdminSpecializations(),
  });

  // 3. Мутація: Схвалення (Апрув)
  const { mutate: approveSpec, isPending: isApproving } = useMutation({
    mutationFn: (requestId: string) => adminService.approveSpecialization(requestId),
    onSuccess: () => {
      toast.success("Спеціалізацію схвалено та додано в загальний список!");
      queryClient.invalidateQueries({ queryKey: ["adminSpecializations"] });
    },
    onError: () => toast.error("Помилка при схваленні спеціалізації"),
  });

  // 4. Мутація: Відхилення (Реджект) - використовуємо існуючий метод відхилення запитів
  const { mutate: rejectSpec, isPending: isRejecting } = useMutation({
    mutationFn: (requestId: string) => adminService.rejectRegistration(requestId, "Відхилено адміністратором"),
    onSuccess: () => {
      toast.success("Запит на спеціалізацію відхилено");
      queryClient.invalidateQueries({ queryKey: ["adminSpecializations"] });
    },
    onError: () => toast.error("Помилка при відхиленні"),
  });

  const onSubmit = (data: { specName: string }) => {
    createDirect(
      { name: data.specName.trim() },
      {
        onSuccess: () => {
          methods.reset();
        },
      }
    );
  };

  // Відфільтровуємо лише ті, що очікують підтвердження (якщо бекенд повертає всі)
  const pendingRequests = proposedRequests?.filter((req: any) => req.status === "PENDING" || !req.status) || [];

  return (
    <div className="dash-page">
      <h2 className="dash-page-title">Управління спеціалізаціями</h2>

      {/* БЛОК 1: ПРЯМЕ СТВОРЕННЯ */}
      <div className="create-card">
        <h3 className="create-card-title">
          <Tag size={20} color="#4f46e5" />
          Створити нову спеціалізацію вручну
        </h3>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="create-form">
            <div style={{ flex: 1 }}>
              <TextInput
                name="specName"
                label=""
                placeholder="Наприклад: Нейрохірург"
                rules={{ required: "Введіть назву спеціалізації" }}
              />
            </div>

            <button
              type="submit"
              className="create-btn"
              disabled={isCreating}
              style={{
                marginTop: methods.formState.errors.specName ? '0' : 'auto',
                marginBottom: 'auto'
              }}
            >
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Створити
            </button>
          </form>
        </FormProvider>
      </div>

      {/* БЛОК 2: ЗАПРОПОНОВАНІ ЛІКАРЯМИ */}
      <div style={{ marginTop: "32px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", marginBottom: "16px", color: "#1e293b", fontWeight: 600 }}>
          <Clock size={22} color="#f59e0b" />
          Запропоновані лікарями (очікують розгляду)
        </h3>

        {isFetching ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
            <Loader2 className="animate-spin" size={18} /> Завантаження запитів...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div style={{ padding: "24px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
            Нових пропозицій від лікарів наразі немає.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingRequests.map((req: any) => (
              <div
                key={req.id || req._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "16px",
                  background: "#fff",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                }}
              >
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: 600 }}>
                    {req.name || req.payload?.name || "Назва не вказана"}
                  </h4>
                  <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#64748b" }}>
                    Запропоновано лікарем: <span style={{ fontWeight: 500 }}>{req.doctorName || req.email || "Невідомо"}</span>
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => approveSpec(req.id || req._id)}
                    disabled={isApproving || isRejecting}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      background: "#ecfdf5",
                      color: "#10b981",
                      border: "1px solid #a7f3d0",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "0.2s"
                    }}
                  >
                    <Check size={16} /> Схвалити
                  </button>

                  <button
                    onClick={() => rejectSpec(req.id || req._id)}
                    disabled={isApproving || isRejecting}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      background: "#fff1f2",
                      color: "#e11d48",
                      border: "1px solid #fecdd3",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                      transition: "0.2s"
                    }}
                  >
                    <X size={16} /> Відхилити
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
