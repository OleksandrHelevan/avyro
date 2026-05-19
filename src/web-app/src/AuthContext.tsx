import {createContext, useContext, useState, useEffect, type ReactNode} from "react";

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
  login: (newToken: string, role?: string, userId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // При завантаженні беремо токен зі стореджу
  const [token, setToken] = useState<string | null>(localStorage.getItem("accessToken") || localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);

      // Розшифровуємо токен, щоб дістати роль та ID при оновленні сторінки
      const decoded = parseJwt(token);
      if (decoded) {
        // Увага: перевірте, як саме називаються поля у вашому токені (може бути просто role, або userRole)
        setRole(decoded.role || decoded.userRole || null);
        setUserId(decoded.id || decoded.userId || decoded.sub || null);
      }
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("token");
      setRole(null);
      setUserId(null);
    }
  }, [token]);

  // Функція логіну (викликається в LoginPage)
  const login = (newToken: string, newRole?: string, newUserId?: string) => {
    setToken(newToken);
    if (newRole) setRole(newRole);
    if (newUserId) setUserId(newUserId);
  };

  // Функція логауту (викликається в Навбарі або Профілі)
  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    localStorage.clear(); // Про всяк випадок чистимо сміття
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
