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
}
