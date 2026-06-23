import { Plus, Loader2, Tag, Check, X, Clock, BookOpen, FileText } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import "./AdminNotifications.css";
import TextInput from "../../components/TextInput/TextInput";

import { useCreateSpecializationDirect } from "../../domains/admin/useSpecializationMutations/useSpecializationMutations.ts";
import { adminService } from "../../domains/admin/service/adminService.ts";
import { useSpecializations } from "../../domains/specializations/useSpecializations/useSpecializations";

export default function AdminSpecializations() {
  const queryClient = useQueryClient();

  const methods = useForm({
    defaultValues: {
      specName: "",
      specDescription: "",
    },
  });

  const { mutate: createDirect, isPending: isCreating } = useCreateSpecializationDirect();

  const { data: proposedRequests, isLoading: isFetchingRequests } = useQuery({
    queryKey: ["adminSpecializations"],
    queryFn: () => adminService.getAdminSpecializations(),
  });

  const { data: allSpecializations, isLoading: isFetchingSpecs } = useSpecializations();

  const { mutate: approveSpec, isPending: isApproving } = useMutation({
    mutationFn: (requestId: string) => adminService.approveSpecialization(requestId),
    onSuccess: () => {
      toast.success("Спеціалізацію схвалено та додано в загальний список!");
      queryClient.invalidateQueries({ queryKey: ["adminSpecializations"] });
      queryClient.invalidateQueries({ queryKey: ["specializations"] });
    },
    onError: () => toast.error("Помилка при схваленні спеціалізації"),
  });

  const { mutate: rejectSpec, isPending: isRejecting } = useMutation({
    mutationFn: (requestId: string) => adminService.rejectRegistration(requestId, "Відхилено адміністратором"),
    onSuccess: () => {
      toast.success("Запит на спеціалізацію відхилено");
      queryClient.invalidateQueries({ queryKey: ["adminSpecializations"] });
    },
    onError: () => toast.error("Помилка при відхиленні"),
  });

  const onSubmit = (data: { specName: string; specDescription: string }) => {
    createDirect(
      {
        name: data.specName.trim(),
        description: data.specDescription.trim() || "Додано адміністратором"
      } as any,
      {
        onSuccess: () => {
          methods.reset();
          queryClient.invalidateQueries({ queryKey: ["specializations"] });
        },
      }
    );
  };

  const pendingRequests = proposedRequests?.filter((req: any) => req.status === "PENDING" || !req.status) || [];
  const existingSpecs = allSpecializations || [];

  return (
    <div className="admin-spec-page">
      <h2 className="admin-spec-title">Управління спеціалізаціями</h2>

      <div className="admin-spec-create-card">
        <h3 className="admin-spec-create-card-title">
          <Tag size={20} color="#4f46e5" />
          Створити нову спеціалізацію вручну
        </h3>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="admin-spec-create-form" style={{ display: "flex", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 250px" }}>
              <TextInput
                name="specName"
                label="Назва спеціалізації"
                placeholder="Наприклад: Нейрохірург"
                rules={{ required: "Введіть назву спеціалізації" }}
              />
            </div>

            <div style={{ flex: "2 1 300px" }}>
              <TextInput
                name="specDescription"
                label="Опис (необов'язково)"
                placeholder="Короткий опис діяльності лікаря..."
              />
            </div>

            <button
              type="submit"
              className="admin-spec-create-btn"
              disabled={isCreating}
              style={{ marginTop: '28px', height: "44px", whiteSpace: "nowrap" }}
            >
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Створити
            </button>
          </form>
        </FormProvider>
      </div>

      <div style={{ marginTop: "32px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", marginBottom: "16px", color: "#1e293b", fontWeight: 600 }}>
          <Clock size={22} color="#f59e0b" />
          Запропоновані лікарями (очікують розгляду)
        </h3>

        {isFetchingRequests ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
            <Loader2 className="animate-spin" size={18} /> Завантаження запитів...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="admin-spec-empty-state" style={{ padding: "24px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
            Нових пропозицій від лікарів наразі немає.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {pendingRequests.map((req: any) => {
              const description = req.description || req.payload?.description;
              const docName = req.doctorName || req.email || req.payload?.doctorName || "Невідомо";

              return (
                <div
                  key={req.id || req._id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    padding: "16px",
                    background: "#fff",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}
                >
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <h4 style={{ margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: 600 }}>
                      {req.name || req.payload?.name || "Назва не вказана"}
                    </h4>

                    {description && (
                      <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#475569", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                        <FileText size={16} color="#94a3b8" style={{ flexShrink: 0, marginTop: "2px" }} />
                        {description}
                      </p>
                    )}

                    <p style={{ margin: "8px 0 0", fontSize: "13px", color: "#64748b" }}>
                      Запропоновано лікарем: <span style={{ fontWeight: 500 }}>{docName}</span>
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => approveSpec(req.id || req._id)}
                      disabled={isApproving || isRejecting}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#ecfdf5", color: "#10b981", border: "1px solid #a7f3d0", borderRadius: "8px", cursor: "pointer", fontWeight: 600, transition: "0.2s" }}
                    >
                      <Check size={16} /> Схвалити
                    </button>

                    <button
                      onClick={() => rejectSpec(req.id || req._id)}
                      disabled={isApproving || isRejecting}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", borderRadius: "8px", cursor: "pointer", fontWeight: 600, transition: "0.2s" }}
                    >
                      <X size={16} /> Відхилити
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ marginTop: "40px", borderTop: "1px solid #e2e8f0", paddingTop: "32px" }}>
        <h3 style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", marginBottom: "16px", color: "#1e293b", fontWeight: 600 }}>
          <BookOpen size={22} color="#10b981" />
          Існуючі спеціалізації на платформі
        </h3>

        {isFetchingSpecs ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b" }}>
            <Loader2 className="animate-spin" size={18} /> Завантаження списку...
          </div>
        ) : existingSpecs.length === 0 ? (
          <div style={{ color: "#64748b" }}>Немає жодної спеціалізації в базі даних.</div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "16px"
          }}>
            {existingSpecs.map((spec: any) => (
              <div key={spec.id || spec._id} style={{
                padding: "16px",
                background: "#f8fafc",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
              }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", color: "#0f172a", fontWeight: 600 }}>
                  {spec.name}
                </h4>
                <p style={{ margin: 0, fontSize: "14px", color: "#475569", lineHeight: "1.5" }}>
                  {spec.description || <span style={{ color: "#94a3b8", fontStyle: "italic" }}>Опис відсутній</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
