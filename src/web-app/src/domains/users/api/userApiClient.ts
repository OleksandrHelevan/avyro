import {apiClient} from "../../../services/apiService.ts";
import type {
  LoginRequest, LoginResponse, SignUpRequest, SignUpResponse,
  GetPatientResponse, PatchPatientRequest, PatchPatientResponse,
  GetDoctorResponse, UpdateDoctorProfileRequest, UpdateProfileResponse,
  Specialization, ScheduleRequest, ScheduleResponse,
  AdminRegistration, ApproveRegistrationResponse, RejectRegistrationResponse, AdminScheduleRequest // ДОДАНО ІМПОРТ ТИПУ
} from "../types.ts";

export const userApiClient = {
  login: async (request: LoginRequest) =>
    apiClient.post<LoginResponse>('/login', request),

  signUp: async (request: SignUpRequest) =>
    apiClient.post<SignUpResponse>('/sign-up', request),

  getPatientById: async (id: string) =>
    apiClient.get<GetPatientResponse>(`/users/patients/${id}`),

  patchPatient: async (id: string, request: PatchPatientRequest) =>
    apiClient.patch<PatchPatientResponse>(`/users/patients/${id}`, request),

  getDoctorById: async (id: string) =>
    apiClient.get<GetDoctorResponse>(`/users/doctors/${id}`),

  patchDoctor: async (id: string, request: UpdateDoctorProfileRequest) =>
    apiClient.patch<UpdateProfileResponse>(`/users/doctors/${id}`, request),

  getAllSpecializations: async () =>
    apiClient.get<Specialization[]>('/specializations/'),

  getSpecializationById: async (spec_id: string) =>
    apiClient.get<Specialization>(`/specializations/${spec_id}`),

  requestSchedule: async (request: ScheduleRequest) =>
    apiClient.post<ScheduleResponse>('/schedules/request', request),

  approveRegistration: async (request_id: string) =>
    apiClient.post<ApproveRegistrationResponse>(`/admin/${request_id}/approve-registration`, {}),

  rejectRegistration: async (request_id: string, comment: string) =>
    apiClient.post<RejectRegistrationResponse>(`/admin/${request_id}/reject?comment=${encodeURIComponent(comment)}`, {}),
  getAdminRegistrations: async () =>
    apiClient.get<AdminRegistration[]>('/admin/registrations'),
// Отримати всі запити на створення розкладів
  getAdminSchedules: async () =>
    apiClient.get<AdminScheduleRequest[]>('/admin/schedules'),
  approveSchedule: async (schedule_id: string) =>
    apiClient.post(`/admin/schedules/${schedule_id}/approve`, {}),

  // Відхилити розклад
  rejectSchedule: async (schedule_id: string, comment: string) =>
    apiClient.post(`/admin/schedules/${schedule_id}/reject?comment=${encodeURIComponent(comment)}`, {}),
  // --- АДМІН: Спеціалізації ---

  // 1. Отримати всі запити на спеціалізації (припускаю, що ендпоінт такий самий за логікою)
  getAdminSpecializations: async () =>
    apiClient.get<any[]>('/admin/specializations'),

  // 2. Створити спеціалізацію напряму
  // Припускаємо, що бекенд чекає об'єкт { name: "Назва" }
  // В userApiClient.ts
  createSpecializationDirect: async (data: { name: string }) => {
    // Лог для перевірки у вашій консолі браузера
    console.log("Відправка на бекенд:", data.name);

    return apiClient.post('/admin/specialization', {
      name: data.name.trim(),
      description: "Створено адміністратором" // Бекенд вимагав description
    });
  },
  // 3. Підтвердити запит на створення
  approveSpecialization: async (requestId: string) =>
    apiClient.post(`/admin/${requestId}/approve-specialization`, {}),
}
