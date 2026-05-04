import { motion } from "framer-motion";
import { Link, useNavigate, useLocation, NavLink } from "react-router-dom"; // Використовуємо NavLink для активних станів
import { Stethoscope, LogOut, User } from "lucide-react"; // SVG замість емодзі
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const hideHeaderRoutes = ["/login", "/sign-up"];

  const isAuthenticated = !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole"); // Не забудьте очистити роль
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
          {/* NavLink автоматично додає клас .active, коли шлях збігається */}
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
            Знайти лікаря
          </NavLink>

          {isAuthenticated && (
            <>
              <NavLink to="/appointments" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                Мої записи
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                Мій кабінет
              </NavLink>
            </>
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
