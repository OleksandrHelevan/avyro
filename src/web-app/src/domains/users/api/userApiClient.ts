import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  GetPatientResponse,
  PatchPatientResponse,
  PatchPatientRequest,
  GetDoctorResponse,
  UpdateDoctorProfileRequest,
  UpdateProfileResponse
} from "../types.ts";
import {apiClient} from "../../../services/apiService.ts";


export const userApiClient = {
  login: async (request: LoginRequest) =>
    apiClient.post<LoginResponse>('/login', request),
  signUp: async (request: SignUpRequest) =>
    apiClient.post<SignUpResponse>('/sign-up', request),
  getPatientById: async (id: string) =>
    apiClient.get<GetPatientResponse>(`/users/patients/${id}`),
  patchPatient: async ( id: string, request: PatchPatientRequest) =>
    apiClient.patch<PatchPatientResponse>(`/users/patients/${id}`, request),
  getDoctorById: async (id: string) =>
    apiClient.get<GetDoctorResponse>(`api/v1/doctors/${id}`),
  updateDoctorProfile: async (request: UpdateDoctorProfileRequest) =>
    apiClient.put<UpdateProfileResponse>('/api/v1/doctors/me/profile', request),
}
