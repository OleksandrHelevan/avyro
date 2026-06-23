import { apiClient } from "../../../services/apiClient.ts";
import type {
  LoginRequest, LoginResponse, SignUpRequest, SignUpResponse,
  GetPatientResponse, PatchPatientRequest, PatchPatientResponse,
  GetDoctorResponse, UpdateDoctorProfileRequest, UpdateProfileResponse,
  ScheduleRequest, ScheduleResponse,
  DoctorListItem, DoctorApprovalResponse,
  GetNotificationsResponse, CreateFeedbackRequest
} from "../types.ts";

export const userApiClient = {
  login: async (request: LoginRequest) =>
    apiClient.post<LoginResponse>('/login', request),

  signUp: async (request: SignUpRequest) =>
    apiClient.post<SignUpResponse>('/sign-up', request),

  getPatientById: async (id: string) =>
    apiClient.get<GetPatientResponse>(`/users/patients/${id}`),

  patchPatient: async (request: PatchPatientRequest) =>
    apiClient.patch<PatchPatientResponse>('/users/patient', request),
  getMyDoctorAppointments: async () =>
    apiClient.get('/appointments/doctor/me'),
  getAllDoctors: async () =>
    apiClient.get<DoctorListItem[]>('/users/doctors'),
  getAllUsers: async () =>
    apiClient.get<any[]>('/users'),
  getDoctorById: async (id: string) =>
    apiClient.get<GetDoctorResponse>(`/users/doctors/${id}`),

  patchDoctor: async ( request: UpdateDoctorProfileRequest) =>
    apiClient.patch<UpdateProfileResponse>(`/users/doctors`, request),

  requestSchedule: async (request: ScheduleRequest) =>
    apiClient.post<ScheduleResponse>('/schedules/request', request),

  // 🚀 ДОДАНО: Метод для оновлення існуючого розкладу (PUT)
  updateSchedule: async (scheduleId: string, request: ScheduleRequest) =>
    apiClient.put<ScheduleResponse>(`/schedules/${scheduleId}`, request),

  checkDoctorStatus: async (email: string) => {
    return apiClient.get<DoctorApprovalResponse>(`/doctors?email=${encodeURIComponent(email)}`);
  },

  getNotifications: async () =>
    apiClient.get<GetNotificationsResponse>('/notifications'),
  markAllNotificationsAsRead: async () =>
    apiClient.post('/notifications/read-all', {}),
  createFeedback: async (doctorId: string, request: CreateFeedbackRequest) =>
    apiClient.post('/feedback', { ...request, doctorId }),
  createDoctorFeedback: async (request: {
    doctor_id: string;
    message: string;
    rating: number;
    visibility: string
  }) =>
    apiClient.post('/feedback/doctor-review', request),
  getAllFeedback: async () =>
    apiClient.get('/feedback/all'),
  getDoctorReviews: async (doctorId: string) =>
    apiClient.get(`/feedback/doctor/${doctorId}`),
};
