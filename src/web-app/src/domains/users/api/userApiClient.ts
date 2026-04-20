import type {LoginRequest, LoginResponse} from "../types.ts";
import {apiClient} from "../../../services/apiService.ts";

export const userApiClient = {
  login: async (request: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', request),
}
