import {userApiClient} from "../api/userApiClient.ts";
import type {
  LoginRequest, LoginResponse, SignUpRequest, SignUpResponse,
  GetPatientResponse, PatchPatientRequest, PatchPatientResponse,
  GetDoctorResponse, UpdateDoctorProfileRequest, UpdateProfileResponse,
  ScheduleRequest, ScheduleResponse,
  DoctorListItem, DoctorApprovalResponse, GetNotificationsResponse
} from "../types.ts";

export const userService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    return userApiClient.login(request);
  },

  signup: async (request: SignUpRequest): Promise<SignUpResponse> => {
    return userApiClient.signUp(request);
  },

  getPatientById: async (id: string): Promise<GetPatientResponse> => {
    return userApiClient.getPatientById(id);
  },

  patchPatient: async (request: PatchPatientRequest): Promise<PatchPatientResponse> => {
    return userApiClient.patchPatient(request);
  },

  getAllDoctors: async (): Promise<DoctorListItem[]> => {
    const response = await userApiClient.getAllDoctors();
    return (response as any).data ?? response;
  },

  getDoctorById: async (id: string): Promise<GetDoctorResponse> => {
    // Чистимо ID від випадкових пробілів, які могли потрапити з URL
    const cleanId = id?.trim() || "";
    const response = await userApiClient.getDoctorById(cleanId);
    return (response as any).data ?? response;
  },

  patchDoctor: async (request: UpdateDoctorProfileRequest): Promise<UpdateProfileResponse> => {
    return userApiClient.patchDoctor(request);
  },

  requestSchedule: async (request: ScheduleRequest): Promise<ScheduleResponse> => {
    return userApiClient.requestSchedule(request);
  },

  checkDoctorStatus: async (email: string): Promise<DoctorApprovalResponse> => {
    return userApiClient.checkDoctorStatus(email);
  },

  getNotifications: async (): Promise<GetNotificationsResponse> => {
    const response = await userApiClient.getNotifications();
    return (response as any).data ?? response;
  },

  markAllNotificationsAsRead: async (): Promise<any> => {
    return userApiClient.markAllNotificationsAsRead();
  },
};
