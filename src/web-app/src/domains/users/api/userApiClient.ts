import { apiClient } from "../../../services/apiService.ts"; // Перевірте свій шлях!
import type {
  LoginRequest, LoginResponse, SignUpRequest, SignUpResponse,
  GetPatientResponse, PatchPatientRequest, PatchPatientResponse,
  GetDoctorResponse, UpdateDoctorProfileRequest, UpdateProfileResponse,
  Specialization, ScheduleRequest, ScheduleResponse
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

  // --- Doctors ---
  getDoctorById: async (id: string) =>
    apiClient.get<GetDoctorResponse>(`/users/doctors/${id}`),

  patchDoctor: async (id: string, request: UpdateDoctorProfileRequest) =>
    apiClient.patch<UpdateProfileResponse>(`/users/doctors/${id}`, request),

  // --- Specializations ---
  getAllSpecializations: async () =>
    apiClient.get<Specialization[]>('/specializations/'),

  // ДОДАНО: Отримання спеціалізації за ID
  getSpecializationById: async (spec_id: string) =>
    apiClient.get<Specialization>(`/specializations/${spec_id}`),

  // --- Schedules ---
  requestSchedule: async (request: ScheduleRequest) =>
    apiClient.post<ScheduleResponse>('/schedules/schedule/request', request),
}
