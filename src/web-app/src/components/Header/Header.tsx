import { motion } from "framer-motion";
// ДОДАНО: імпортуємо useLocation
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  // ДОДАНО: отримуємо поточний шлях
  const location = useLocation();

  // ДОДАНО: Масив сторінок, на яких ми НЕ хочемо показувати хедер взагалі
  const hideHeaderRoutes = ["/login", "/sign-up"];

  // Перевіряємо, чи залогінений користувач
  const isAuthenticated = !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));

  // Функція виходу
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  // ДОДАНО: Якщо ми зараз на сторінці логіну або реєстрації — повертаємо null (ховаємо хедер)
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
        <div className="logo-group">
          <span className="logo-icon-med">⚕️</span>
          <h1><span className="logo-accent">Avyro</span></h1>
        </div>

        <div className="nav-links">
          <Link to="/" className="nav-link active-link">Знайти лікаря</Link>
          {isAuthenticated && (
            <>
              <Link to="/appointments" className="nav-link">Мої записи</Link>
              <Link to="/profile" className="nav-link">Мій кабінет</Link>
            </>
          )}
        </div>

        {isAuthenticated ? (
          <div className="auth-group">
            <Link to="/profile" className="user-profile">
            </Link>
            <button className="btn-logout" onClick={handleLogout}>
              Вийти
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
