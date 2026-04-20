import {userApiClient} from "../api/userApiClient.ts";
import type {LoginRequest, LoginResponse} from "../types.ts";

export const userService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    return userApiClient.login(request);
  },
}
