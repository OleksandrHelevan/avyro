export interface CreateAppointmentRequest {
  slotId: string;
  doctorId: string;
  pricePerSlot?: number;
  payment_method: "MONEY" | "POINTS" | "MIXED"; // Поле оплати
  note?: string;
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

  payment_method?: "MONEY" | "POINTS" | "MIXED";
  amount_paid?: number;
  points_used?: number;
  money_charged?: number;
  new_balance?: number;
}


export interface AppointmentDetailResponse {
  _id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  from: string;
  to: string;
  status: "RESERVED" | "FINISHED" | "CANCELLED" | string;
  price?: number;
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
export interface CancelAppointmentRequest {
  reason?: string;
}
