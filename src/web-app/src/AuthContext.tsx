import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

// Допоміжна функція для розшифровки JWT токена
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  isAuthLoading: boolean; // 🚀 ДОДАНО: стан завантаження
  login: (newToken: string, role?: string, userId?: string) => Promise<void>; // 🚀 ДОДАНО: Promise
  logout: () => Promise<void>; // 🚀 ДОДАНО: Promise
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Стан для відстеження первинної ініціалізації
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);

  // 1. АСИНХРОННА ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("accessToken") || localStorage.getItem("token");

        if (storedToken) {
          setToken(storedToken);
          const decoded = parseJwt(storedToken);

          if (decoded) {
            setRole(decoded.role || decoded.userRole || null);
            setUserId(decoded.id || decoded.userId || decoded.sub || null);
          }
        }
      } catch (error) {
        console.error("Помилка ініціалізації авторизації:", error);
      } finally {
        setIsAuthLoading(false); // Ініціалізація завершена
      }
    };

    initAuth();
  }, []);

  // 2. АСИНХРОННА СИНХРОНІЗАЦІЯ ТОКЕНА З STORAGE
  useEffect(() => {
    if (isAuthLoading) return; // Не записуємо нічого, поки йде перше завантаження

    const syncStorage = async () => {
      if (token) {
        localStorage.setItem("accessToken", token);
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("token");
      }
    };

    syncStorage();
  }, [token, isAuthLoading]);

  // 3. АСИНХРОННИЙ ЛОГІН
  const login = async (newToken: string, newRole?: string, newUserId?: string): Promise<void> => {
    return new Promise((resolve) => {
      setToken(newToken);
      if (newRole) setRole(newRole);
      if (newUserId) setUserId(newUserId);
      resolve();
    });
  };

  // 4. АСИНХРОННИЙ ЛОГАУТ
  const logout = async (): Promise<void> => {
    return new Promise((resolve) => {
      setToken(null);
      setRole(null);
      setUserId(null);
      localStorage.clear();
      resolve();
    });
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, isAuthLoading, login, logout }}>
      {/* Можна додати глобальний лоадер тут: if (isAuthLoading) return <Loader /> */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
