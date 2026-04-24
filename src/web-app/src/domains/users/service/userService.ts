import {userApiClient} from "../api/userApiClient.ts";
import type {
  LoginRequest,
  LoginResponse,
  SignUpRequest,
  SignUpResponse,
  GetPatientResponse,
  PatchPatientRequest,
  PatchPatientResponse, GetDoctorResponse,
  UpdateDoctorProfileRequest,
  UpdateProfileResponse
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
  patchPatient: async (id: string, request: PatchPatientRequest): Promise<PatchPatientResponse> => {
    return userApiClient.patchPatient(id, request)
  },
  getDoctorById: async (id: string): Promise<GetDoctorResponse> => {
    return userApiClient.getDoctorById(id);

  },
  updateDoctorProfile: async (request: UpdateDoctorProfileRequest): Promise<UpdateProfileResponse> => {
    return userApiClient.updateDoctorProfile(request);
  }
}
