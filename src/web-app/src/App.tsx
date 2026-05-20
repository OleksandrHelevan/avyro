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
import { useDoctor } from "./domains/users/useDoctor/useDoctor";
import { AuthProvider, useAuth } from "./AuthContext.tsx";

interface DoctorData {
  status?: string;
  isApproved?: boolean;
  isActive?: boolean;
}

const checkIsDoctorApproved = (doctor: DoctorData | undefined): boolean => {
  if (!doctor) return false;
  return (
    doctor.isActive === true ||
    doctor.status?.toUpperCase() === "APPROVED" ||
    doctor.isApproved === true
  );
};

const ProfileDispatcher = () => {
  const { role, userId } = useAuth();
  const isDoctorRole = role === "DOCTOR";

  const { data, isLoading } = useDoctor(isDoctorRole ? userId || "" : "");
  const doctor = data as DoctorData | undefined;

  if (!isDoctorRole) return <PatientProfile />;
  if (isLoading) return <div className="loading-screen">Завантаження профілю...</div>;

  if (!checkIsDoctorApproved(doctor)) {
    return <NotApprovedPage />;
  }

  return <DoctorProfile />;
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
  if (role !== "ADMIN") return <Navigate to="/" replace />;
  return <Outlet />;
};

const DoctorOnlyRoute = () => {
  const { role, userId } = useAuth();
  const isDoctorRole = role === "DOCTOR";

  const { data, isLoading } = useDoctor(isDoctorRole ? userId || "" : "");
  const doctor = data as DoctorData | undefined;

  if (!isDoctorRole) return <Navigate to="/profile" replace />;
  if (isLoading) return <div className="loading-screen">Перевірка доступу...</div>;

  if (!checkIsDoctorApproved(doctor)) {
    return <Navigate to="/profile" replace />;
  }

  return <Outlet />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#fff', color: '#363636' },
        }}
      />

      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout />}>

              {/* 🚀 ДОДАНО: Відкритий роут для непідтверджених лікарів без токена */}
              <Route path="not-approved" element={<NotApprovedPage />} />

              <Route element={<ProtectedRoute />}>
                <Route index element={<HomePage />} />
                <Route path="doctor/:id" element={<DoctorProfilePage />} />
                <Route path="appointments" element={<PatientAppointmentsPage />} />
                <Route path="profile" element={<ProfileDispatcher />} />

                <Route element={<DoctorOnlyRoute />}>
                  <Route path="schedule-edit" element={<ScheduleEditor />} />
                  <Route path="patients" element={<div>Сторінка пацієнтів</div>} />
                </Route>

                <Route element={<AdminRoute />}>
                  <Route path="admin/requests" element={<AdminRequests />} />
                  <Route path="admin/specializations" element={<AdminNotifications />} />
                  <Route path="admin/schedules" element={<AdminSchedules />} />
                </Route>
              </Route>

              <Route element={<PublicRoute />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="sign-up" element={<SignUpPage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
