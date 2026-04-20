export interface LoginRequest {
  email: string;
  password: string;
}
type Role = 'DOCTOR' | 'PATIENT' | 'ADMIN';

export interface LoginResponse {
  token: string;
  role: Role;
  exp: number;
}
