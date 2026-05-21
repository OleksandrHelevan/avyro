import type {ReactNode} from "react";
import "./Sidebar.css";

interface SidebarProps {
  children: ReactNode;
  className?: string;
}

export default function Sidebar({children, className = ""}: SidebarProps) {
  return (
    <aside className={`custom-sidebar ${className}`}>
      <nav className="sidebar-menu glass-light">
        {children}
      </nav>
    </aside>
  );
}
