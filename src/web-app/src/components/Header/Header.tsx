import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, NavLink, useNavigate } from "react-router-dom";
import { User, Menu, X, LogOut, Bell, Megaphone, Clock, CheckCircle2, Info } from "lucide-react";
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import { useState, useMemo, useEffect, useRef } from "react";
import logoImg from "./img.png";
import { useAuth } from "../../context/auth/useAuth.tsx";

import { useNotifications } from "../../domains/users/useNotifications/useNotifications.ts";
import Loader from "../../components/Loader/Loader.tsx";

import "./Header.css";
import { useMarkNotificationsRead } from "../../domains/users/useMarkNotificationsRead/useMarkNotificationsRead.ts";

interface DoctorData {
  status?: string;
  isApproved?: boolean;
  isActive?: boolean;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { token, userId, logout, isDoctor, isPatient, isAdmin } = useAuth();

  const isAuthenticated = !!token;

  const { data } = useDoctor(isDoctor && userId ? userId : "");
  const doctor = data as DoctorData | undefined;

  const isApprovedDoctor = isDoctor && doctor?.isActive === true;
  const hideHeaderRoutes = ["/login", "/sign-up"];

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const { data: notifData, isLoading: isNotifLoading } = useNotifications();
  const { mutate: markAsRead } = useMarkNotificationsRead();

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unread_count ?? 0;

  useEffect(() => {
    if (isNotifOpen && unreadCount > 0) {
      markAsRead();
    }
  }, [isNotifOpen, unreadCount, markAsRead]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => {
      return new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime();
    });
  }, [notifications]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleLogout = () => {
    logout();
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
        <Link
          to="/"
          className="logo-group"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
          onClick={closeMobileMenu}
        >
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '40px', height: '40px', overflow: 'hidden', borderRadius: '8px'
          }}>
            <img src={logoImg} alt="Avyro Med Logo" style={{ height: "100%", width: "auto", objectFit: "cover", mixBlendMode: "multiply" }} />
          </div>
          <h1><span className="logo-accent" style={{ fontWeight: '700' }}>Avyro</span></h1>
        </Link>

        <button className="mobile-menu-btn" onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <div className={`nav-links-container ${isMobileOpen ? "open" : ""}`}>
          <div className="nav-links">
            {/* 🚀 ОНОВЛЕНО: Тепер "Знайти лікаря" ховається і від адміна, і від лікаря */}
            {(!isAdmin && !isDoctor) && (
              <NavLink to="/" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                Знайти лікаря
              </NavLink>
            )}

            {isAuthenticated && isPatient && (
              <NavLink to="/appointments" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                Мої записи
              </NavLink>
            )}

            {isAuthenticated && isApprovedDoctor && (
              <>
                <NavLink to="/schedule-edit" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  Мій розклад
                </NavLink>
                <NavLink to="/doctor/appointments" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  Мої візити
                </NavLink>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <NavLink to="/admin/requests" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  Реєстрації
                </NavLink>
                <NavLink to="/admin/specializations" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  Спеціалізації
                </NavLink>
                <NavLink to="/admin/schedules" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  Розклади
                </NavLink>
                <NavLink to="/admin/feedbacks" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "nav-link active-link" : "nav-link"}>
                  Відгуки
                </NavLink>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <div className="auth-group">

              {isAdmin && (
                <NavLink
                  to="/admin/notifications"
                  onClick={closeMobileMenu}
                  className={({ isActive }) => isActive ? "profile-icon-btn active-icon" : "profile-icon-btn"}
                  title="Надіслати сповіщення"
                >
                  <Megaphone size={26} strokeWidth={2.2} color="#7b51b3" />
                </NavLink>
              )}

              <div className="notif-wrapper" ref={notifRef}>
                <button
                  className={`profile-icon-btn ${isNotifOpen ? "active-icon" : ""}`}
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  title="Мої сповіщення"
                  style={{ border: "none", outline: "none", background: "transparent", cursor: "pointer", padding: 0 }}
                >
                  <Bell size={28} strokeWidth={2.2} color={isNotifOpen ? "#7b51b3" : "currentColor"} />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      className="notif-dropdown glass-light"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="notif-dropdown-header">
                        <h4>Сповіщення</h4>
                      </div>
                      <div className="notif-dropdown-body">
                        {isNotifLoading ? (
                          <div className="notif-loader"><Loader /></div>
                        ) : sortedNotifications.length === 0 ? (
                          <div className="notif-empty">
                            <Bell size={32} color="#cbd5e1" />
                            <p>Немає нових сповіщень</p>
                          </div>
                        ) : (
                          sortedNotifications.map((notif) => {
                            const n = notif as any;
                            const apptId = n.appointmentId || n.payload?.appointmentId || n.data?.appointmentId;
                            return (
                              <div
                                key={notif.id}
                                className={`notif-dropdown-item ${notif.is_read ? 'read' : 'unread'}`}
                                onClick={() => {
                                  if (apptId) {
                                    setIsNotifOpen(false);
                                    closeMobileMenu();
                                    navigate(`/appointments/${apptId}`);
                                  }
                                }}
                                style={{ cursor: apptId ? 'pointer' : 'default' }}
                              >
                                <div className="notif-item-icon">
                                  {notif.is_read ? <CheckCircle2 size={18} color="#94a3b8" /> : <Info size={18} color="#7b51b3" />}
                                </div>
                                <div className="notif-item-content">
                                  <p>{notif.message}</p>
                                  <span className="notif-item-time">
                                    <Clock size={12} /> {formatDate(notif.sent_at)}
                                  </span>
                                </div>
                                {!notif.is_read && <div className="notif-item-dot" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {isAdmin ? (
                <button onClick={handleLogout} className="profile-icon-btn" title="Вийти" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#e11d48' }}>
                  <LogOut size={28} strokeWidth={2.2} />
                </button>
              ) : (
                <NavLink to="/profile" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "profile-icon-btn active-icon" : "profile-icon-btn"} title="Мій кабінет">
                  <User size={32} strokeWidth={2.2} />
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
