import {userApiClient} from "../api/userApiClient.ts";
import type {
  LoginRequest, LoginResponse, SignUpRequest, SignUpResponse,
  GetPatientResponse, PatchPatientRequest, PatchPatientResponse,
  GetDoctorResponse, UpdateDoctorProfileRequest, UpdateProfileResponse,
  Specialization, ScheduleRequest, ScheduleResponse,
  AdminRegistration, ApproveRegistrationResponse, RejectRegistrationResponse,
  DoctorListItem // ДОДАНО ІМПОРТ ТИПУ
} from "../types.ts";

export const userService = {
  // --- Auth ---
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    return userApiClient.login(request);
  },

  signup: async (request: SignUpRequest): Promise<SignUpResponse> => {
    return userApiClient.signUp(request);
  },

  // --- Patients ---
  getPatientById: async (id: string): Promise<GetPatientResponse> => {
    return userApiClient.getPatientById(id);
  },

  patchPatient: async (id: string, request: PatchPatientRequest): Promise<PatchPatientResponse> => {
    return userApiClient.patchPatient(id, request);
  },

  // --- Doctors ---
  // === НОВИЙ МЕТОД ДЛЯ ОТРИМАННЯ ВСІХ ЛІКАРІВ ===
  getAllDoctors: async (): Promise<DoctorListItem[]> => {
    // Якщо ваш apiClient повертає безпосередньо дані (через інтерцептор),
    // залишаємо так. Якщо він повертає axios response, треба додати .data
    const response = await userApiClient.getAllDoctors();
    return (response as any).data ?? response;
  },

  getDoctorById: async (id: string): Promise<GetDoctorResponse> => {
    console.log(`!!!${userApiClient.getDoctorById(id)}`);

    return userApiClient.getDoctorById(id);
  },

  patchDoctor: async (id: string, request: UpdateDoctorProfileRequest): Promise<UpdateProfileResponse> => {
    return userApiClient.patchDoctor(id, request);
  },

  // --- Specializations ---
  getAllSpecializations: async (): Promise<Specialization[]> => {
    return userApiClient.getAllSpecializations();
  },

  getSpecializationById: async (spec_id: string): Promise<Specialization> => {
    return userApiClient.getSpecializationById(spec_id);
  },

  // --- Schedules (For Doctors) ---
  requestSchedule: async (request: ScheduleRequest): Promise<ScheduleResponse> => {
    return userApiClient.requestSchedule(request);
  },

  // --- ADMIN: Registrations ---
  getAdminRegistrations: async (): Promise<AdminRegistration[]> => {
    return userApiClient.getAdminRegistrations();
  },

  approveRegistration: async (requestId: string): Promise<ApproveRegistrationResponse> => {
    return userApiClient.approveRegistration(requestId);
  },

  rejectRegistration: async (requestId: string, comment: string): Promise<RejectRegistrationResponse> => {
    return userApiClient.rejectRegistration(requestId, comment);
  },

  // --- АДМІН: Розклади ---
  getAdminSchedules: async () => {
    return userApiClient.getAdminSchedules();
  },

  approveSchedule: async (scheduleId: string) => {
    return userApiClient.approveSchedule(scheduleId);
  },

  rejectSchedule: async (scheduleId: string, comment: string) => {
    return userApiClient.rejectSchedule(scheduleId, comment);
  },

  // --- ADMIN: Specializations ---
  getAdminSpecializations: async (): Promise<any[]> => {
    return userApiClient.getAdminSpecializations();
  },

  createSpecializationDirect: async (data: { name: string }): Promise<any> => {
    return userApiClient.createSpecializationDirect(data);
  },

  approveSpecialization: async (requestId: string): Promise<any> => {
    return userApiClient.approveSpecialization(requestId);
  },
};
