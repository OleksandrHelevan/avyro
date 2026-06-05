export interface AdminRegistrationPayload {
  email: string;
  password?: string;
  role: string;
  isActive: boolean;
  profile: any | null;
}

export interface AdminRegistration {
  _id: string;
  creatorId: string | null;
  type: string;
  status: string;
  payload: AdminRegistrationPayload;
  adminComment: string | null;
  createdAt: string;
  updatedAt: string;
  processedAt: string | null;
  processedBy: string | null;
}
export interface ApproveRegistrationResponse {
  _id: string;
  email: string;
  role: string;
  isActive: boolean;
  profile: any | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}
export interface RejectRegistrationResponse {
  status: string;
}
export interface AdminSchedulePayload {
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  slotsCount?: number;
  [key: string]: any;
}

export interface AdminScheduleRequest {
  _id: string;
  type: string;
  status: string;
  payload: AdminSchedulePayload;
  createdAt: string;
  updatedAt?: string;
}
export interface SendNotificationRequest {
  message: string;
  recipient_id: string | null;
}

export interface SendNotificationResponse {
  id: string;
  message: string;
  is_read: boolean;
  sent_at: string;
  recipient_id: string | null;
}
