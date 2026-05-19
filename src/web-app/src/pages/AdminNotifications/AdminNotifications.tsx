import { Plus, Loader2, Tag } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";

import "./AdminNotifications.css";
import TextInput from "../../components/TextInput/TextInput";

import { useCreateSpecializationDirect } from "../../domains/specializations/useSpecializationMutations/useSpecializationMutations.ts";

export default function AdminSpecializations() {
  // Ініціалізуємо react-hook-form для контролю інпута
  const methods = useForm({
    defaultValues: {
      specName: "",
    },
  });

  // Залишаємо тільки мутацію прямого створення
  const { mutate: createDirect, isPending: isCreating } = useCreateSpecializationDirect();

  const onSubmit = (data: { specName: string }) => {
    createDirect(
      { name: data.specName.trim() },
      {
        onSuccess: () => {
          methods.reset(); // Очищаємо поле після успішного створення
        },
      }
    );
  };

  return (
    <div className="dash-page">
      <h2 className="dash-page-title">Управління спеціалізаціями</h2>

      {/* БЛОК ПРЯМОГО СТВОРЕННЯ */}
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
    </div>
  );
}
