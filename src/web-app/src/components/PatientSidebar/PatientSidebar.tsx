import { Link, useLocation } from "react-router-dom";
import { User, Star, Wallet } from "lucide-react";
import "./PatientSidebar.css";

export default function PatientSidebar() {
  const { pathname } = useLocation();

  const links = [
    { to: "/profile",       icon: <User size={18} />,            label: "Особисті дані" },
    { to: "/gamification",  icon: <Star size={18} strokeWidth={2.5} />, label: "Досягнення та Бали" },
    { to: "/wallet",        icon: <Wallet size={18} />,          label: "Фінансовий баланс" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-menu glass-light slide-in-left">
        {links.map(({ to, icon, label }) => (
          <Link
            key={to}
            to={to}
            className={`menu-item ${pathname === to ? "active" : ""}`}
          >
            {icon}
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
