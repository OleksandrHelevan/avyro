import { Navigate, Outlet } from "react-router-dom";
import {useAuth} from "../../../context/auth/useAuth.tsx";

export default function PublicRoute() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
