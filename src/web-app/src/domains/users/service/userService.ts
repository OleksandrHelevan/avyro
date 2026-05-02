import { userApiClient } from "../api/userApiClient.ts";
import type {
  LoginRequest, LoginResponse, SignUpRequest, SignUpResponse,
  GetPatientResponse, PatchPatientRequest, PatchPatientResponse,
  GetDoctorResponse, UpdateDoctorProfileRequest, UpdateProfileResponse,
  Specialization, ScheduleRequest, ScheduleResponse
} from "../types.ts";
import {getFromStorage} from "../../../utils/localStorageUtil.ts";

export const userService = {
  login: async (request: LoginRequest): Promise<LoginResponse> => {
    return userApiClient.login(request);
  },

  signup: async (request: SignUpRequest): Promise<SignUpResponse> => {
    return userApiClient.signUp(request);
  },

  // --- Patients ---
  getPatientById: async (id: string): Promise<GetPatientResponse> => {
    return userApiClient.getPatientById(id);
  },

  patchPatient: async (id: string, request: PatchPatientRequest): Promise<PatchPatientResponse> => {
    return userApiClient.patchPatient(id, request);
  },

  // --- Doctors ---
  getDoctorById: async (id: string): Promise<GetDoctorResponse> => {
    return userApiClient.getDoctorById(id);
  },

  patchDoctor: async (request: UpdateDoctorProfileRequest): Promise<UpdateProfileResponse> => {
    const id = getFromStorage('userId') || "";
    return userApiClient.patchDoctor(id, request);
  },

  // --- Specializations ---
  getAllSpecializations: async (): Promise<Specialization[]> => {
    return userApiClient.getAllSpecializations();
  },

  // ДОДАНО: Отримання спеціалізації за ID
  getSpecializationById: async (spec_id: string): Promise<Specialization> => {
    return userApiClient.getSpecializationById(spec_id);
  },

  // --- Schedules ---
  requestSchedule: async (request: ScheduleRequest): Promise<ScheduleResponse> => {
    return userApiClient.requestSchedule(request);
  }
};
