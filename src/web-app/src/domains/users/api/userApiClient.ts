import type {LoginRequest, LoginResponse, SignUpRequest, SignUpResponse, GetPatientResponse} from "../types.ts";
import {apiClient} from "../../../services/apiService.ts";


export const userApiClient = {
  login: async (request: LoginRequest) =>
    apiClient.post<LoginResponse>('/login', request),
  signUp: async (request: SignUpRequest) =>
    apiClient.post<SignUpResponse>('/sign-up', request),
  getPatientById: async (id: string) =>
    apiClient.get<GetPatientResponse>(`/users/patients/${id}`),
}
