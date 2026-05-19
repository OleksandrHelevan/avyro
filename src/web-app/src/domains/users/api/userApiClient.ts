import {apiClient} from "../../../services/apiService.ts";
import type {
  LoginRequest, LoginResponse, SignUpRequest, SignUpResponse,
  GetPatientResponse, PatchPatientRequest, PatchPatientResponse,
  GetDoctorResponse, UpdateDoctorProfileRequest, UpdateProfileResponse,
   ScheduleRequest, ScheduleResponse,

  DoctorListItem
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

  getAllDoctors: async () =>
    apiClient.get<DoctorListItem[]>('/users/doctors'),

  getDoctorById: async (id: string) =>
    apiClient.get<GetDoctorResponse>(`/users/doctors/${id}`),

  patchDoctor: async ( request: UpdateDoctorProfileRequest) =>
    apiClient.patch<UpdateProfileResponse>(`/users/doctors`, request),


  requestSchedule: async (request: ScheduleRequest) =>
    apiClient.post<ScheduleResponse>('/schedules/request', request),

  checkDoctorStatus: async (email: string) => {
    return apiClient.get<any>(`/doctors?email=${encodeURIComponent(email)}`);
  },
}
