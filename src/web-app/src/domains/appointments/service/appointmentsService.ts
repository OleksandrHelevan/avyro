import { appointmentsApiClient } from "../api/appointmentsApiClient.ts";
import type {
  AppointmentResponse,
  AppointmentDetailResponse,
  CreateAppointmentRequest,
} from "../types.ts";

export const appointmentsService = {
  getMyPatientAppointments: async (): Promise<AppointmentResponse[]> => {
    const res = await appointmentsApiClient.getMyPatientAppointments();
    return (res as any).data ?? res;
  },

  createAppointment: async (request: CreateAppointmentRequest): Promise<AppointmentResponse> => {
    const res = await appointmentsApiClient.createAppointment(request);
    return (res as any).data ?? res;
  },

  // ── NEW ──────────────────────────────────────────────────────────────────
  getAppointmentById: async (id: string): Promise<AppointmentDetailResponse> => {
    const res = await appointmentsApiClient.getAppointmentById(id);
    return (res as any).data ?? res;
  },
};
