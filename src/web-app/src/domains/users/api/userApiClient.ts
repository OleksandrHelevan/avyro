import type {LoginRequest, LoginResponse, SignUpRequest, SignUpResponse} from "../types.ts";
import {apiClient} from "../../../services/apiService.ts";

export const userApiClient = {
  login: async (request: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', request),
  signUp: async (request: SignUpRequest) =>
    apiClient.post<SignUpResponse>('/auth/sign-up', request),
}
