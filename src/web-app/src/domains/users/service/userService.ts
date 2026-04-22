import {userApiClient} from "../api/userApiClient.ts";
import type {LoginRequest, LoginResponse, SignUpRequest, SignUpResponse, GetPatientResponse} from "../types.ts";

export const userService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    return userApiClient.login(request);
  },
  signup: async (request: SignUpRequest): Promise<SignUpResponse> => {
    return userApiClient.signUp(request);
  },
  getPatientById: async (id: string): Promise<GetPatientResponse> => {
    return userApiClient.getPatientById(id);
  }
}
