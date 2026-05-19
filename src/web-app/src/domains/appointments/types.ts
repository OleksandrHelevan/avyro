export  interface CreateAppointmentRequest {
  slotId: string;
}

export interface AppointmentResponse {
  _id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  from: string;
  to: string;
  status: string;
}
