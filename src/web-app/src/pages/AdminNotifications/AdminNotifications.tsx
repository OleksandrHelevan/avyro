import { Plus, Check, X, Loader2, Tag, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useForm, FormProvider } from "react-hook-form"; // ДОДАНО

import "./AdminNotifications.css";
// Імпортуйте ваш кастомний інпут (ПЕРЕВІРТЕ ШЛЯХ ДО ФАЙЛУ!)
import TextInput from "../../components/TextInput/TextInput";

import {
  useApproveSpecialization,
  useCreateSpecializationDirect
} from "../../domains/specializations/useSpecializationMutations/useSpecializationMutations.ts";
import { useAdminSpecializations } from "../../domains/admin/useAdminSpecializations/useAdminSpecializations.ts";
import { useRejectSchedule } from "../../domains/admin/useRejectSchedule/useRejectSchedule.ts";

export default function AdminSpecializations() {
  // 1. Ініціалізуємо react-hook-form замість useState
  const methods = useForm({
    defaultValues: {
      specName: "",
    },
  });

  const { data: requests, isLoading, isError } = useAdminSpecializations();
  const { mutate: createDirect, isPending: isCreating } = useCreateSpecializationDirect();
  const { mutate: approveSpec, isPending: isApproving } = useApproveSpecialization();
  const { mutate: rejectReq, isPending: isRejecting } = useRejectSchedule();

  // 2. Обробка форми тепер приймає дані з react-hook-form
  const onSubmit = (data: { specName: string }) => {
    createDirect(
      { name: data.specName.trim() },
      {
        onSuccess: () => {
          methods.reset(); // Очищаємо поле після успіху
        },
      }
    );
  };

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

        {/* 3. Обгортаємо форму в FormProvider */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="create-form">

            <div style={{ flex: 1 }}> {/* Обгортка, щоб інпут розтягнувся */}
              {/* ВИКОРИСТОВУЄМО ВАШ TextInput */}
              <TextInput
                name="specName"
                label="" // Можна залишити пустим, якщо не треба текст над інпутом
                placeholder="Наприклад: Нейрохірург"
                rules={{ required: "Введіть назву спеціалізації" }}
              />
            </div>

            <button
              type="submit"
              className="create-btn"
              disabled={isCreating}
              style={{ marginTop: methods.formState.errors.specName ? '0' : 'auto', marginBottom: 'auto' }}
              // Вирівнюємо кнопку по центру відносно інпута
            >
              {isCreating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              Створити
            </button>
          </form>
        </FormProvider>
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
            const data = req.payload || req;
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
