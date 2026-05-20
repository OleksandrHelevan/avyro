import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getFromStorage, setInStorage, clearFromStorage } from "./utils/localStorageUtil"; // Перевір шлях
import Loader from "./components/Loader/Loader"; // Перевір шлях

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  isAuthLoading: boolean;

  // Зручні прапорці для перевірки ролей
  isDoctor: boolean;
  isPatient: boolean;
  isAdmin: boolean;

  login: (newToken: string, newRole: string, newUserId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = getFromStorage<string>("accessToken");
      const storedRole = getFromStorage<string>("userRole");
      const storedUserId = getFromStorage<string>("userId");

      if (storedToken) {
        setToken(storedToken);
        setRole(storedRole || null);
        setUserId(storedUserId || null);
      }

      setIsAuthLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newRole: string, newUserId: string) => {
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);

    setInStorage("accessToken", newToken);
    setInStorage("userRole", newRole);
    setInStorage("userId", newUserId);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);

    clearFromStorage("accessToken");
    clearFromStorage("userRole");
    clearFromStorage("userId");
    clearFromStorage("savedDoctorEmail");
  };

  // Вираховуємо ролі "на льоту" для зручності
  const isDoctor = role === "DOCTOR";
  const isPatient = role === "PATIENT";
  const isAdmin = role === "ADMIN";

  return (
    <AuthContext.Provider value={{
      token, role, userId, isAuthLoading,
      isDoctor, isPatient, isAdmin,
      login, logout
    }}>
      {isAuthLoading ? (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
