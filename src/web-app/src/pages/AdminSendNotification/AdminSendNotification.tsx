import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Bell, Send, Users, User, Loader2, MessageSquare } from "lucide-react";

import "./AdminSendNotification.css";
import { apiClient } from "../../services/apiClient.ts";
import { userService } from "../../domains/users/service/userService.ts";

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

  const { data: allUsers = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["adminAllUsers"],
    queryFn: () => userService.getAllUsers(),
  });

  const { mutate: sendNotification, isPending } = useMutation({
    mutationFn: async (data: { message: string; recipient_id: string | null }) => {
      return apiClient.post('/admin/notification', data);
    },
    onSuccess: () => {
      toast.success("Сповіщення успішно надіслано!");
      reset({ message: "", recipientId: "", sendMode });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Помилка при надсиланні сповіщення");
    },
  });

  const onSubmit = (data: NotificationForm) => {
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
                  <p>Оберіть зі списку</p>
                </div>
              </label>
            </div>
          </div>

          {sendMode === "single" && (
            <div className="form-group slide-down">
              <label>Оберіть користувача</label>
              {isUsersLoading ? (
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px", color: "#6b7280" }}>
                  <Loader2 className="animate-spin" size={16} /> Завантаження списку...
                </div>
              ) : (
                <select
                  {...register("recipientId", {
                    required: sendMode === "single" ? "Оберіть користувача обов'язково" : false
                  })}
                  className={`custom-input ${errors.recipientId ? "input-error" : ""}`}
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #d1d5db", backgroundColor: "white", cursor: "pointer" }}
                >
                  <option value="">-- Оберіть користувача зі списку --</option>
                  {allUsers.map((user: any) => (
                    <option key={user._id || user.id} value={user._id || user.id}>
                      {user.fullName || "Без імені"} ({user.email}) — [{user.role}]
                    </option>
                  ))}
                </select>
              )}
              {errors.recipientId && <span className="error-text">{errors.recipientId.message}</span>}
            </div>
          )}

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
