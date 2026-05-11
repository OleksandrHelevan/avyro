import {motion} from "framer-motion";
import {Link, useLocation, NavLink, useNavigate} from "react-router-dom";
import {User, Menu, X, LogOut} from "lucide-react";
import {useDoctor} from "../../domains/users/useDoctor/useDoctor";
import "./Header.css";
import {useState} from "react";

// ІМПОРТ ЛОГОТИПУ (замініть шлях на реальний у вашому проєкті)

interface DoctorData {
  status?: string;
  isApproved?: boolean;
  isActive?: boolean;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const role = localStorage.getItem("userRole")?.replace(/"/g, '');
  const userId = localStorage.getItem("userId")?.replace(/"/g, '');
  const isAuthenticated = !!(localStorage.getItem("accessToken") || localStorage.getItem("token"));

  const isDoctorRole = role === "DOCTOR";
  const {data} = useDoctor(isDoctorRole ? userId || "" : "");
  const doctor = data as DoctorData | undefined;

  const isApprovedDoctor = isDoctorRole && doctor?.isActive === true;
  const hideHeaderRoutes = ["/login", "/sign-up"];

  const closeMobileMenu = () => setIsMobileOpen(false);

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
      initial={{y: -60, opacity: 0}}
      animate={{y: 0, opacity: 1}}
      transition={{duration: 0.6}}
    >
      <div className="nav-content">
        {/* ОНОВЛЕНА ЛОГО-ГРУПА */}
        <Link
          to="/"
          className="logo-group"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
          onClick={closeMobileMenu}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            overflow: 'hidden',
            borderRadius: '8px' // Робимо невелике закруглення самому контейнеру
          }}>
            <img
              src="/src/img.png"
              alt="Avyro Med Logo"
              style={{
                height: "100%", // Заповнюємо контейнер
                width: "auto",
                objectFit: "cover",
                // Цей фільтр спробує зробити білий фон прозорим, якщо він чистий
                mixBlendMode: "multiply",
              }}
            />
          </div>
          <h1><span className="logo-accent" style={{ fontWeight: '700' }}>Avyro</span></h1>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={28}/> : <Menu size={28}/>}
        </button>

        <div className={`nav-links-container ${isMobileOpen ? "open" : ""}`}>
          <div className="nav-links">
            <NavLink to="/" onClick={closeMobileMenu}
                     className={({isActive}) => isActive ? "nav-link active-link" : "nav-link"}>
              Знайти лікаря
            </NavLink>

            {isAuthenticated && role === "PATIENT" && (
              <NavLink to="/appointments" onClick={closeMobileMenu}
                       className={({isActive}) => isActive ? "nav-link active-link" : "nav-link"}>
                Мої записи
              </NavLink>
            )}

            {isAuthenticated && isApprovedDoctor && (
              <>
                <NavLink to="/schedule-edit" onClick={closeMobileMenu}
                         className={({isActive}) => isActive ? "nav-link active-link" : "nav-link"}>
                  Мій розклад
                </NavLink>
                <NavLink to="/patients" onClick={closeMobileMenu}
                         className={({isActive}) => isActive ? "nav-link active-link" : "nav-link"}>
                  Пацієнти
                </NavLink>
              </>
            )}

            {isAuthenticated && role === "ADMIN" && (
              <>
                <NavLink to="/admin/requests" onClick={closeMobileMenu}
                         className={({isActive}) => isActive ? "nav-link active-link" : "nav-link"}>
                  <span>Реєстрації</span>
                </NavLink>

                <NavLink to="/admin/specializations" onClick={closeMobileMenu}
                         className={({isActive}) => isActive ? "nav-link active-link" : "nav-link"}>
                  <span>Спеціалізації</span>
                </NavLink>

                <NavLink to="/admin/schedules" onClick={closeMobileMenu}
                         className={({isActive}) => isActive ? "nav-link active-link" : "nav-link"}>
                  <span>Розклади</span>
                </NavLink>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <div className="auth-group">
              {role === "ADMIN" ? (
                <button
                  onClick={handleLogout}
                  className="profile-icon-btn"
                  title="Вийти"
                  style={{border: 'none', background: 'transparent', cursor: 'pointer', color: '#e11d48'}}
                >
                  <LogOut size={32} strokeWidth={2}/>
                </button>
              ) : (
                <NavLink
                  to="/profile"
                  onClick={closeMobileMenu}
                  className={({isActive}) => isActive ? "profile-icon-btn active-icon" : "profile-icon-btn"}
                  title="Мій кабінет"
                >
                  <User size={32} strokeWidth={2}/>
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
