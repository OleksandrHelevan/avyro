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
  lastLoginAt: Date;
}

export interface PatchPatientRequest {
  fullName: string;
  phone: string;
  avatarUrl: string;
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

}

export interface UpdateDoctorProfileRequest {
  full_name: string;
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

// --- Спеціалізації (додано) ---
export interface Specialization {
  id: string;
  name: string;
  description: string;
}

// --- Розклад ---

export interface RepeatingConfig {
  type: "WEEKLY" | "DAILY" | "MONTHLY" | string; // Можна розширити за потреби
  daysOfWeek: number[];                          // Масив днів тижня (наприклад, 1=Пн, 3=Ср)
  startTime: string;                             // Формат "HH:mm" (наприклад, "09:00")
  endTime: string;                               // Формат "HH:mm" (наприклад, "18:00")
  slotDuration: number;                          // Тривалість слота у хвилинах
  timezone: string;                              // Наприклад, "UTC" або "Europe/Kyiv"
}

export interface ScheduleRequest {
  doctorId: string;              // Зверніть увагу: camelCase (doctorId), а не doctor_id
  month: number;
  year: number;
  title: string;
  isRepeated: boolean;
  repeating?: RepeatingConfig;   // Робимо необов'язковим (?), якщо isRepeated = false
}

export type ScheduleResponse = Record<string, any>;
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
// Очікувана структура даних всередині розкладу
export interface AdminSchedulePayload {
  doctorId?: string;
  startDate?: string;
  endDate?: string;
  slotsCount?: number;
  [key: string]: any; // Дозволяє будь-які інші поля, поки ми не побачимо реальні дані
}

// Сама картка запиту, яка приходить з бекенду
export interface AdminScheduleRequest {
  _id: string;
  type: string;
  status: string;
  payload: AdminSchedulePayload;
  createdAt: string;
  updatedAt?: string;
}
export interface DoctorListItem {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  specializationId: string | null;
}
