import {apiClient} from "../../../services/apiClient.ts";
import type {
  AppointmentResponse, CreateAppointmentRequest // ДОДАНО ІМПОРТ ТИПУ
} from "../types.ts";

export const appointmentsApiClient = {

  createAppointment: async (request: CreateAppointmentRequest) =>

    apiClient.post<AppointmentResponse>('/appointments', request),

  getMyPatientAppointments: async () =>
    apiClient.get<AppointmentResponse[]>('/appointments/patient/me'),

}
