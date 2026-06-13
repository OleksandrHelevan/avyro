import { apiClient } from "../../../services/apiClient.ts";
import type {
  AdminRegistration,
  ApproveRegistrationResponse,
  RejectRegistrationResponse,
  AdminScheduleRequest,
  SendNotificationResponse,
  SendNotificationRequest,
  AdminFeedback
} from "../types.ts";

export const adminApiClient = {

  /* ===== REGISTRATIONS ===== */
  getAdminRegistrations: async () =>
    apiClient.get<AdminRegistration[]>("/admin/registrations"),

  approveRegistration: async (request_id: string) =>
    apiClient.post<ApproveRegistrationResponse>(
      `/admin/${request_id}/approve-registration`,
      {}
    ),

  rejectRegistration: async (request_id: string, comment: string) =>
    apiClient.post<RejectRegistrationResponse>(
      `/admin/${request_id}/reject?comment=${encodeURIComponent(comment)}`,
      {}
    ),

  /* ===== SCHEDULES ===== */
  getAdminSchedules: async () =>
    apiClient.get<AdminScheduleRequest[]>("/admin/schedules"),

  approveSchedule: async (schedule_id: string) =>
    apiClient.post(`/admin/${schedule_id}/approve-schedule`, {}),

  rejectSchedule: async (schedule_id: string, comment: string) =>
    apiClient.post(
      `/admin/${schedule_id}/reject?comment=${encodeURIComponent(comment)}`,
      {}
    ),
  /* ===== SPECIALIZATIONS ===== */
  getAdminSpecializations: async () =>
    apiClient.get<any[]>("/admin/specializations"),

  approveSpecialization: async (request_id: string) =>
    apiClient.post(`/admin/${request_id}/approve-specialization`, {}),

  // 🚀 ОНОВЛЕНО: Тепер приймаємо description і передаємо його на бекенд
  createSpecializationDirect: async (data: { name: string; description?: string }) => {
    return apiClient.post("/admin/specialization", {
      name: data.name.trim(),
      description: data.description?.trim() || "Створено адміністратором"
    });
  },
  /* ===== NOTIFICATIONS ===== */
  sendNotification: async (data: SendNotificationRequest) =>
    apiClient.post<SendNotificationResponse>("/admin/notification", data),

  /* ===== FEEDBACK ===== */
  getAllFeedbacks: async () =>
    apiClient.get<AdminFeedback[]>("/feedback/all"),
};
