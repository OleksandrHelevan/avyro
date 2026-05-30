export interface CreateAppointmentRequest {
  slotId: string;
  pricePerSlot?: number;
}

export interface AppointmentResponse {
  _id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  from: string;
  to: string;
  status: string;
  price?: number;
}

// ─── GET /appointments/{appointment_id} ───────────────────────────────────

export interface AppointmentDetailResponse {
  _id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  from: string;
  to: string;
  status: "RESERVED" | "FINISHED" | "CANCELLED" | string;
  price?: number;
  // backend may embed nested objects — guard with optional chaining
  doctor?: {
    _id: string;
    fullName: string;
    specializationName?: string;
    avatarUrl?: string;
    phone?: string;
    email?: string;
  };
  patient?: {
    _id: string;
    fullName: string;
    avatarUrl?: string;
    phone?: string;
    email?: string;
  };
}
