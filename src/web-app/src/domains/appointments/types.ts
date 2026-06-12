export interface CreateAppointmentRequest {
  slotId: string;
  doctorId: string; // Обов'язково додаємо doctorId
  pricePerSlot?: number;
  payment_method: "MONEY" | "POINTS" | "MIXED"; // Поле оплати
  note?: string; // 🚀 ДОДАНО: Поле для нотатки пацієнта
}

// ... інший код без змін ...
export interface AppointmentResponse {
  _id: string;
  patientId: string;
  doctorId: string;
  slotId: string;
  from: string;
  to: string;
  status: string;
  price?: number;

  // Нові поля з бекенду про результати оплати
  payment_method?: "MONEY" | "POINTS" | "MIXED";
  amount_paid?: number;
  points_used?: number;
  money_charged?: number;
  new_balance?: number;
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
