export interface LoginRequest {
  email: string;
  password: string;
}
type Role = 'DOCTOR' | 'PATIENT' | 'ADMIN';

export interface LoginResponse {
  accessToken: string;
  role: Role;
  expiresAt: number;
  tokenType: string;
  userId: string;
}

export interface Profile{
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
