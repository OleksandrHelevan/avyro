import { Navigate, Outlet } from "react-router-dom";
import {useAuth} from "../../../context/auth/useAuth.tsx";

export default function AdminRoute() {
  const { role } = useAuth();

  if (role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
