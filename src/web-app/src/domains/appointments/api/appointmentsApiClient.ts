import { apiClient } from "../../../services/apiClient.ts";
import type {
  AppointmentResponse,
  AppointmentDetailResponse,
  CreateAppointmentRequest,
} from "../types.ts";

export const appointmentsApiClient = {
  createAppointment: async (request: CreateAppointmentRequest) =>
    apiClient.post<AppointmentResponse>("/appointments", request),

  getMyPatientAppointments: async () =>
    apiClient.get<AppointmentResponse[]>("/appointments/patient/me"),

  // ── NEW: GET /appointments/{appointment_id} ────────────────────────────
  getAppointmentById: async (id: string) =>
    apiClient.get<AppointmentDetailResponse>(`/appointments/${id}`),
};
