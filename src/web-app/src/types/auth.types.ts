export interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  isAuthLoading: boolean;

  isDoctor: boolean;
  isPatient: boolean;
  isAdmin: boolean;

  login: (
    newToken: string,
    newRole: string,
    newUserId: string
  ) => void;

  logout: () => void;
}
