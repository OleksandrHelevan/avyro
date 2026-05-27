import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Bell, Send, Users, User, Loader2, MessageSquare } from "lucide-react";

// 🚀 Перевір шлях до твого apiClient!
import "./AdminSendNotification.css";
import {apiClient} from "../../services/apiClient.ts";

interface NotificationForm {
  sendMode: "all" | "single";
  recipientId: string;
  message: string;
}

export default function AdminSendNotification() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<NotificationForm>({
    defaultValues: {
      sendMode: "all",
      recipientId: "",
      message: "",
    },
  });

  const sendMode = watch("sendMode");

  const { mutate: sendNotification, isPending } = useMutation({
    mutationFn: async (data: { message: string; recipient_id: string | null }) => {
      // Робимо POST запит на ендпоінт зі скриншота
      return apiClient.post('/admin/notification', data);
    },
    onSuccess: () => {
      toast.success("Сповіщення успішно надіслано!");
      // Очищаємо поле повідомлення, але залишаємо обраний режим
      reset({ message: "", recipientId: "", sendMode });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Помилка при надсиланні сповіщення");
    },
  });

  const onSubmit = (data: NotificationForm) => {
    // Якщо вибрано "всім" - відправляємо null (None), інакше - ID юзера
    const payload = {
      message: data.message.trim(),
      recipient_id: data.sendMode === "all" ? null : data.recipientId.trim(),
    };

    sendNotification(payload);
  };

  return (
    <div className="dash-page aero-viewport">
      <div className="page-header">
        <h2 className="dash-page-title" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Bell size={28} color="black" />
          Система сповіщень
        </h2>
        <p style={{ color: "black", marginTop: "8px" }}>
          Надсилайте повідомлення користувачам платформи
        </p>
      </div>

      <div className="notification-card glass-light">
        <form onSubmit={handleSubmit(onSubmit)} className="notification-form">

          {/* БЛОК ВИБОРУ ОДЕРЖУВАЧА */}
          <div className="form-section">
            <h3 className="section-title">Одержувач</h3>

            <div className="radio-group">
              <label className={`radio-card ${sendMode === "all" ? "active" : ""}`}>
                <input
                  type="radio"
                  value="all"
                  {...register("sendMode")}
                  className="hidden-radio"
                />
                <Users size={24} className="radio-icon" />
                <div className="radio-content">
                  <h4>Всім користувачам</h4>
                  <p>Масова розсилка</p>
                </div>
              </label>

              <label className={`radio-card ${sendMode === "single" ? "active" : ""}`}>
                <input
                  type="radio"
                  value="single"
                  {...register("sendMode")}
                  className="hidden-radio"
                />
                <User size={24} className="radio-icon" />
                <div className="radio-content">
                  <h4>Конкретному юзеру</h4>
                  <p>За ID користувача</p>
                </div>
              </label>
            </div>
          </div>

          {/* ПОЛЕ ДЛЯ ID (Показується тільки якщо вибрано "Конкретному юзеру") */}
          {sendMode === "single" && (
            <div className="form-group slide-down">
              <label>ID Користувача (recipient_id)</label>
              <input
                type="text"
                placeholder="Введіть унікальний ID..."
                {...register("recipientId", {
                  required: sendMode === "single" ? "ID користувача обов'язковий" : false
                })}
                className={`custom-input ${errors.recipientId ? "input-error" : ""}`}
              />
              {errors.recipientId && <span className="error-text">{errors.recipientId.message}</span>}
            </div>
          )}

          {/* ПОЛЕ ДЛЯ ТЕКСТУ ПОВІДОМЛЕННЯ */}
          <div className="form-section">
            <h3 className="section-title">Текст сповіщення</h3>
            <div className="form-group">
              <div className="textarea-wrapper">
                <MessageSquare className="textarea-icon" size={20} />
                <textarea
                  placeholder="Напишіть ваше повідомлення тут..."
                  rows={5}
                  {...register("message", {
                    required: "Повідомлення не може бути порожнім",
                    minLength: { value: 5, message: "Мінімум 5 символів" }
                  })}
                  className={`custom-textarea ${errors.message ? "input-error" : ""}`}
                />
              </div>
              {errors.message && <span className="error-text">{errors.message.message}</span>}
            </div>
          </div>

          {/* КНОПКА ВІДПРАВКИ */}
          <div className="form-actions">
            <button type="submit" disabled={isPending} className="send-btn glow-effect">
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Надсилання...
                </>
              ) : (
                <>
                  <Send size={20} /> Надіслати сповіщення
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
