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
}

export interface ScheduleRequest {
  doctorId: string;
  month: number;
  year: number;
  title: string;
  isRepeated: boolean;
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
