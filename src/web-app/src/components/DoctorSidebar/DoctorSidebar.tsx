import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet } from "lucide-react";

export default function DoctorSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-menu glass-light">
        <Link
          to="/profile"
          className={`menu-item ${pathname === "/profile" ? "active" : ""}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <LayoutDashboard size={18} />
          <span>Кабінет лікаря</span>
        </Link>

        <Link
          to="/wallet"
          className={`menu-item ${pathname === "/wallet" ? "active" : ""}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Wallet size={18} />
          <span>Баланс</span>
        </Link>


      </div>
    </aside>
  );
}
