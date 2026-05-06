import { motion } from "framer-motion";
import { Link, useLocation, NavLink, useNavigate } from "react-router-dom";
import { Stethoscope, User, Menu, X, LogOut } from "lucide-react";
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import "./Header.css";
import { useState } from "react";

// Типізація для коректної роботи з даними лікаря
interface DoctorData {
  status?: string;
  isApproved?: boolean;
  isActive?: boolean;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  // Закриваємо меню при кліку на посилання
  const closeMobileMenu = () => setIsMobileOpen(false);

  // Функція виходу
  const handleLogout = () => {
    localStorage.clear();
    closeMobileMenu();
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
        <Link to="/" className="logo-group" style={{ textDecoration: 'none' }} onClick={closeMobileMenu}>
          <Stethoscope className="logo-icon-svg" size={28} />
          <h1><span className="logo-accent">Avyro</span></h1>
        </Link>

        {/* Кнопка бургера */}
        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Контейнер для посилань */}
        <div className={`nav-links-container ${isMobileOpen ? "open" : ""}`}>
          <div className="nav-links">
            {/* Спільне посилання */}
            <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
              Знайти лікаря
            </NavLink>

            {/* НАВІГАЦІЯ ПАЦІЄНТА */}
            {isAuthenticated && role === "PATIENT" && (
              <NavLink to="/appointments" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                Мої записи
              </NavLink>
            )}

            {/* НАВІГАЦІЯ ЛІКАРЯ */}
            {isAuthenticated && isApprovedDoctor && (
              <>
                <NavLink to="/schedule-edit" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  Мій розклад
                </NavLink>
                <NavLink to="/patients" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  Пацієнти
                </NavLink>
              </>
            )}

            {/* НАВІГАЦІЯ АДМІНІСТРАТОРА */}
            {isAuthenticated && role === "ADMIN" && (
              <>
                <NavLink to="/admin/requests" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  <div className="nav-item-with-icon">
                    <span>Запити</span>
                  </div>
                </NavLink>

                {/* ОНОВЛЕНО: Замість сповіщень тепер Спеціалізації */}
                <NavLink to="/admin/specializations" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  <div className="nav-item-with-icon">
                    <span>Спеціалізації</span>
                  </div>
                </NavLink>

                <NavLink to="/admin/schedules" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  <div className="nav-item-with-icon">
                    <span>Розклади</span>
                  </div>
                </NavLink>
              </>
            )}
          </div>

          {/* ПРАВИЙ БЛОК */}
          {isAuthenticated ? (
            <div className="auth-group">
              {role === "ADMIN" ? (
                <button
                  onClick={handleLogout}
                  className="profile-icon-btn"
                  title="Вийти"
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#e11d48' }}
                >
                  <LogOut size={32} strokeWidth={2} />
                </button>
              ) : (
                <NavLink
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={({ isActive }) => isActive ? "profile-icon-btn active-icon" : "profile-icon-btn"}
                  title="Мій кабінет"
                >
                  <User size={32} strokeWidth={2} />
                </NavLink>
              )}
            </div>
          ) : (
            <div className="auth-group">
              <Link to="/login" className="btn-login" onClick={closeMobileMenu}>Увійти</Link>
              <Link to="/sign-up" className="btn-signup" onClick={closeMobileMenu}>Реєстрація</Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
