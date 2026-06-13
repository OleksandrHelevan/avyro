import { appointmentsApiClient } from "../api/appointmentsApiClient.ts";
import type {
  AppointmentResponse,
  AppointmentDetailResponse,
  CreateAppointmentRequest, CancelAppointmentRequest,
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
  cancelAppointment: async (id: string, payload: CancelAppointmentRequest): Promise<AppointmentResponse> => {
    const res = await appointmentsApiClient.cancelAppointment(id, payload);
    return (res as any).data ?? res;
  },
  finishAppointment: async (id: string, payload: { note: string }): Promise<AppointmentResponse> => {
    const res = await appointmentsApiClient.finishAppointment(id, payload);
    return (res as any).data ?? res;
  },
  addAppointmentNote: async (id: string, payload: { note: string }): Promise<any> => {
    const res = await appointmentsApiClient.addAppointmentNote(id, payload);
    return (res as any).data ?? res;
  },
};
