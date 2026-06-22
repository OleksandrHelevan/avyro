import {userApiClient} from "../api/userApiClient.ts";
import type {
  LoginRequest, LoginResponse, SignUpRequest, SignUpResponse,
  GetPatientResponse, PatchPatientRequest, PatchPatientResponse,
  GetDoctorResponse, UpdateDoctorProfileRequest, UpdateProfileResponse,
  ScheduleRequest, ScheduleResponse,
  DoctorListItem, DoctorApprovalResponse, GetNotificationsResponse, CreateFeedbackRequest
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
    const cleanId = id?.trim() || "";
    const response = await userApiClient.getDoctorById(cleanId);
    return (response as any).data ?? response;
  },

  patchDoctor: async (request: UpdateDoctorProfileRequest): Promise<UpdateProfileResponse> => {
    return userApiClient.patchDoctor(request);
  },
  getAllUsers: async (): Promise<any[]> => {
    const response = await userApiClient.getAllUsers();
    return (response as any).data ?? response;
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
  getMyDoctorAppointments: async () => {
    const response = await userApiClient.getMyDoctorAppointments();
    return (response as any).data ?? response;
  },
  markAllNotificationsAsRead: async (): Promise<any> => {
    return userApiClient.markAllNotificationsAsRead();
  },
  createFeedback: async (doctorId: string, request: CreateFeedbackRequest): Promise<any> => {
    return userApiClient.createFeedback(doctorId, request);
  },
  createDoctorFeedback: async (request: {
    doctor_id: string;
    message: string;
    rating: number;
    visibility: string
  }) => {
    return userApiClient.createDoctorFeedback(request);
  },
  getAllFeedback: async (): Promise<any[]> => {
    const response = await userApiClient.getAllFeedback();
    return (response as any).data ?? response;
  },
  getDoctorReviews: async (doctorId: string): Promise<any[]> => {
    const response = await userApiClient.getDoctorReviews(doctorId);
    return (response as any).data ?? response;
  },
};
