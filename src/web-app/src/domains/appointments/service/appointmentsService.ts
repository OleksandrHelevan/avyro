import type {
  AppointmentResponse, CreateAppointmentRequest
} from "../types.ts";
import {appointmentsApiClient} from "../api/appointmentsApiClient.ts";

export const appointmentsService = {

  getMyPatientAppointments: async (): Promise<AppointmentResponse[]> => {
    const res = await appointmentsApiClient.getMyPatientAppointments();
    return (res as any).data ?? res;
  },
  createAppointment: async (request: CreateAppointmentRequest): Promise<AppointmentResponse> => {

    return appointmentsApiClient.createAppointment(request);
  },
};
