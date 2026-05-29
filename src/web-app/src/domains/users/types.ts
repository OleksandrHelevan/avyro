import type {Reward} from "../rewards/type.ts";

export type Role = 'DOCTOR' | 'PATIENT' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  role: Role;
  expiresAt: number;
  tokenType: string;
  userId: string;
}

export interface Profile {
  fullName: string;
  phone: string;
  specializationId: string;
  avatarUrl: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  role: Role;
  isActive: boolean;
  profile: Profile | null;
}

export interface SignUpResponse {
  _id: string;
  email: string;
  role: Role;
  isActive: boolean;
  profile: Profile;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface GetPatientResponse {
  _id: string;
  email: string;
  isActive: boolean;
  fullName: string;
  phone: string;
  avatarUrl: string;
  createdAt: Date;
  address: string;
  lastLoginAt: Date;
  rewards: Reward;
}

export interface PatchPatientRequest {
  fullName: string;
  phone: string;
  avatarUrl: string;
  address: string;
}

export interface PatchPatientResponse {
  _id: string;
  name: string;
  isActive: boolean;
  fullName: string;
  phone: string;
  avatarUrl: string;
  createdAt: Date;
  lastLoginAt: Date;
  rewards: Reward;
}

// --- Доктор ---
export interface GetDoctorResponse {
  _id: string;
  email: string;
  isActive: boolean;
  fullName: string;
  phone: string;
  avatarUrl: string;
  createdAt: Date;
  lastLoginAt: Date;
  specializationName: string;
  schedule: any[]; // Додайте це поле тут
  pricePerSlot?: number; // 🚀 ДОДАНО: Ціна за слот (глобальна для лікаря)
  price?: number;        // 🚀 ДОДАНО: Залишив для зворотної сумісності (про всяк випадок)
}

export interface UpdateDoctorProfileRequest {
  fullName: string;
  phone: string;
  avatarUrl: string;
  specialization_id: string;
}

export interface UpdateProfileResponse {
  _id: string;
  email: string;
  isActive: boolean;
  fullName: string;
  phone: string;
  avatarUrl: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface RepeatingConfig {
  type: "WEEKLY" | "DAILY" | "MONTHLY" | string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  slotDuration: number;
  timezone: string;
  pricePerSlot?: number; // 🚀 ДОДАНО: Ціна всередині конфігу
}

export interface ScheduleRequest {
  doctorId: string;
  month: number;
  year: number;
  title: string;
  isRepeated: boolean;
  pricePerSlot: number;  // 🚀 ДОДАНО: Обов'язкова ціна на верхньому рівні запиту
  repeating?: RepeatingConfig;
}

export type ScheduleResponse = Record<string, any>;

export interface DoctorListItem {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  specializationId: string | null;
}

export interface DoctorApprovalResponse {
  isAuthenticated: boolean;
  isPending: boolean;
}

export interface NotificationItem {
  id: string;
  message: string;
  is_read: boolean;
  sent_at: string;
  recipient_id: string | null;
}

export interface GetNotificationsResponse {
  notifications: NotificationItem[];
  unread_count: number;
}
