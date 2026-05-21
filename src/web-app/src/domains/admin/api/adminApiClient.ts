import { apiClient } from "../../../services/apiClient.ts";
import type {
  AdminRegistration,
  ApproveRegistrationResponse,
  RejectRegistrationResponse,
  AdminScheduleRequest,
} from "../types.ts";

export const adminApiClient = {

  approveRegistration: async (request_id: string) =>
    apiClient.post<ApproveRegistrationResponse>(`/admin/${request_id}/approve-registration`, {}),

  rejectRegistration: async (request_id: string, comment: string) =>
    apiClient.post<RejectRegistrationResponse>(`/admin/${request_id}/reject?comment=${encodeURIComponent(comment)}`, {}),

  getAdminRegistrations: async () =>
    apiClient.get<AdminRegistration[]>('/admin/registrations'),

  getAdminSchedules: async () =>
    apiClient.get<AdminScheduleRequest[]>('/admin/schedules'),

  approveSchedule: async (schedule_id: string) =>
    apiClient.post(`/admin/${schedule_id}/approve-schedule`, {}),

  rejectSchedule: async (schedule_id: string, comment: string) =>
    apiClient.post(`/admin/${schedule_id}/reject?comment=${encodeURIComponent(comment)}`, {}),

  getAdminSpecializations: async () =>
    apiClient.get<any[]>('/admin/specializations'),

  approveSpecialization: async (request_id: string) =>
    apiClient.post(`/admin/${request_id}/approve-specialization`, {}),

  createSpecializationDirect: async (data: { name: string }) => {
    console.log("Відправка на бекенд:", data.name);
    return apiClient.post('/admin/specialization', {
      name: data.name.trim(),
      description: "Створено адміністратором"
    });
  },

};
