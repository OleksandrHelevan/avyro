import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// --- СТОРІНКИ ---
import HomePage from './pages/HomePage/HomePage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.tsx';
import PatientProfile from "./pages/PatientProfile/PatientProfile.tsx";
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile.tsx";
import DoctorProfilePage from "./pages/DoctorProfilePage/DoctorProfilePage.tsx";
import ScheduleEditor from "./pages/ScheduleEditor/ScheduleEditor.tsx";
import NotApprovedPage from "./pages/NotApprovedPage/NotApprovedPage.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";
import AdminSchedules from "./pages/AdminSchedules/AdminSchedules.tsx";
import AdminRequests from "./pages/AdminRequests/AdminRequests.tsx";
import AdminNotifications from "./pages/AdminNotifications/AdminNotifications.tsx";
import PatientAppointmentsPage from "./pages/PatientAppointmentsPage/PatientAppointmentsPage.tsx";

// --- ЛЕЙАУТ ТА СЕРВІСИ ---
import RootLayout from "./layouts/RootLayout/RootLayout.tsx";
import { queryClient } from "./services/queryClient.ts";
import { useCheckDoctorStatus } from "./domains/users/useCheckDoctorStatus/useCheckDoctorStatus.tsx";
import { AuthProvider, useAuth } from "./AuthContext.tsx";
import Loader from "./components/Loader/Loader.tsx";

const MainApprovalInterceptor = () => {
  const { token } = useAuth();

  const savedEmail = !token ? localStorage.getItem("savedDoctorEmail") : null;

  const { data: statusResponse, isLoading } = useCheckDoctorStatus(savedEmail);

  if (savedEmail && isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </div>
    );
  }

  if (!token && savedEmail) {
    if (statusResponse?.isPending === true) {
      return <Navigate to="/not-approved" replace />;
    }

    if (statusResponse?.isPending === false || statusResponse?.isAuthenticated === true) {
      return <Outlet />;
    }
  }

  return <Outlet />;
};

const ProtectedRoute = () => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const { token } = useAuth();
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
};

const AdminRoute = () => {
  const { role } = useAuth();
  if (role !== "ADMIN") return <Navigate to="/login" replace />;
  return <Outlet />;
};

const ProfileDispatcher = () => {
  const { isDoctor } = useAuth();
  return isDoctor ? <DoctorProfile /> : <PatientProfile />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route path="not-approved" element={<NotApprovedPage />} />
              <Route element={<MainApprovalInterceptor />}>
                <Route element={<PublicRoute />}>
                  <Route path="login" element={<LoginPage />} />
                  <Route path="sign-up" element={<SignUpPage />} />
                </Route>
                <Route element={<ProtectedRoute />}>
                  <Route index element={<HomePage />} />
                  <Route path="doctor/:id" element={<DoctorProfilePage />} />
                  <Route path="appointments" element={<PatientAppointmentsPage />} />
                  <Route path="profile" element={<ProfileDispatcher />} />
                  <Route path="schedule-edit" element={<ScheduleEditor />} />
                  <Route path="patients" element={<div>Сторінка пацієнтів</div>} />
                  <Route element={<AdminRoute />}>
                    <Route path="admin/requests" element={<AdminRequests />} />
                    <Route path="admin/specializations" element={<AdminNotifications />} />
                    <Route path="admin/schedules" element={<AdminSchedules />} />
                  </Route>
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
