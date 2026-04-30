export interface LoginRequest {
  email: string;
  password: string;
}
export type Role = 'DOCTOR' | 'PATIENT' | 'ADMIN';

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
export interface GetDoctorResponse {
  status: string;
  message: string;
}
export interface UpdatePatientProfileRequest {
  fullName: string;
  phone: string;
  avatarUrl: string;
}

export interface UpdateDoctorProfileRequest {
  full_name: string;
  specialization_id: string;

}

export interface UpdateProfileResponse {
status:string;
  message: string;
}
