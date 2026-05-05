import { motion } from "framer-motion";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import "./Header.css";

// Типізація для коректної роботи з даними лікаря
interface DoctorData {
  status?: string;
  isApproved?: boolean;
  isActive?: boolean;
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // Отримуємо дані про користувача
  const role = localStorage.getItem("userRole")?.replace(/"/g, '');
  const userId = localStorage.getItem("userId")?.replace(/"/g, '');
  const isAuthenticated = !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));

  // Дані для лікаря
  const isDoctorRole = role === "DOCTOR";
  const { data } = useDoctor(isDoctorRole ? userId || "" : "");
  const doctor = data as DoctorData | undefined;

  // Перевірка статусу (isActive)
  const isApprovedDoctor = isDoctorRole && doctor?.isActive === true;

  const hideHeaderRoutes = ["/login", "/sign-up"];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (hideHeaderRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <motion.nav
      className="white-nav"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="nav-content">
        <Link to="/" className="logo-group" style={{ textDecoration: 'none' }}>
          <Stethoscope className="logo-icon-svg" size={28} />
          <h1><span className="logo-accent">Avyro</span></h1>
        </Link>

        <div className="nav-links">
          {/* Спільне посилання */}
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
            Знайти лікаря
          </NavLink>

          {/* НАВІГАЦІЯ ПАЦІЄНТА */}
          {isAuthenticated && role === "PATIENT" && (
            <NavLink to="/appointments" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
              Мої записи
            </NavLink>
          )}

          {/* НАВІГАЦІЯ ЛІКАРЯ (тільки для активних) */}
          {isAuthenticated && isApprovedDoctor && (
            <>
              <NavLink to="/schedule-edit" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                Мій розклад
              </NavLink>
              <NavLink to="/patients" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                Пацієнти
              </NavLink>
            </>
          )}

          {/* НАВІГАЦІЯ АДМІНІСТРАТОРА */}
          {isAuthenticated && role === "ADMIN" && (
            <>
              <NavLink to="/admin/requests" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                <div className="nav-item-with-icon">
                  <span>Запити</span>
                </div>
              </NavLink>
              <NavLink to="/admin/notifications" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                <div className="nav-item-with-icon">
                  <span>Сповіщення</span>
                </div>
              </NavLink>
              <NavLink to="/admin/schedules" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                <div className="nav-item-with-icon">
                  <span>Розклади</span>
                </div>
              </NavLink>
            </>
          )}

          {/* КАБІНЕТ */}
          {isAuthenticated && (
            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
              Мій кабінет
            </NavLink>
          )}
        </div>

        {isAuthenticated ? (
          <div className="auth-group">
            <button className="btn-logout" onClick={handleLogout}>
              <span>Вийти</span>
            </button>
          </div>
        ) : (
          <div className="auth-group">
            <Link to="/login" className="btn-login">Увійти</Link>
            <Link to="/sign-up" className="btn-signup">Реєстрація</Link>
          </div>
        )}
      </div>
    </motion.nav>
  );
}
