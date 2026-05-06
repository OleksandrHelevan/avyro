import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// Сторінки
import HomePage from './pages/HomePage/HomePage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.tsx';
import PatientProfile from "./pages/PatientProfile/PatientProfile.tsx";
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile.tsx";
import ScheduleEditor from "./pages/ScheduleEditor/ScheduleEditor.tsx";
import NotApprovedPage from "./pages/NotApprovedPage/NotApprovedPage.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";


// Лейаут та сервіси
import RootLayout from "./layouts/RootLayout/RootLayout.tsx";
import { queryClient } from "./services/queryClient.ts";
import { useDoctor } from "./domains/users/useDoctor/useDoctor";
import AdminSchedules from "./pages/AdminSchedules/AdminSchedules.tsx";
import AdminRequests from "./pages/AdminRequests/AdminRequests.tsx";
import AdminNotifications from "./pages/AdminNotifications/AdminNotifications.tsx";

interface DoctorData {
  status?: string;
  isApproved?: boolean;
  isActive?: boolean;
}

// --- ДИСПЕТЧЕР ПРОФІЛІВ ---
const ProfileDispatcher = () => {
  const role = localStorage.getItem("userRole")?.replace(/"/g, '');
  const userId = localStorage.getItem("userId")?.replace(/"/g, '');

  const isDoctorRole = role === "DOCTOR";
  const { data, isLoading } = useDoctor(isDoctorRole ? userId || "" : "");
  const doctor = data as DoctorData | undefined;

  if (!isDoctorRole) return <PatientProfile />;
  if (isLoading) return <div className="loading-screen">Завантаження профілю...</div>;

  const isApproved =
    doctor?.isActive === true ||
    doctor?.status?.toUpperCase() === "APPROVED" ||
    doctor?.isApproved === true;

  if (!isApproved) return <NotApprovedPage />;

  return <DoctorProfile />;
};

// --- ЗАХИСТ МАРШРУТІВ ---

const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
};

const PublicRoute = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
};

const AdminRoute = () => {
  const role = localStorage.getItem("userRole")?.replace(/"/g, '');
  if (role !== "ADMIN") return <Navigate to="/" replace />;
  return <Outlet />;
};

const DoctorOnlyRoute = () => {
  const role = localStorage.getItem("userRole")?.replace(/"/g, '');
  const userId = localStorage.getItem("userId")?.replace(/"/g, '');

  const isDoctorRole = role === "DOCTOR";
  const { data, isLoading } = useDoctor(isDoctorRole ? userId || "" : "");
  const doctor = data as DoctorData | undefined;

  if (!isDoctorRole) return <Navigate to="/profile" replace />;
  if (isLoading) return null;

  const isApproved =
    doctor?.isActive === true ||
    doctor?.status?.toUpperCase() === "APPROVED" ||
    doctor?.isApproved === true;

  if (!isApproved) return <Navigate to="/profile" replace />;

  return <Outlet />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
          },
        }}
        containerStyle={{
          top: 20,
          left: 20,
          bottom: 20,
          right: 20,
        }}
        gutter={8}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>

            <Route element={<ProtectedRoute />}>
              <Route index element={<HomePage />} />
              <Route path="profile" element={<ProfileDispatcher />} />

              {/* Маршрути для активних лікарів */}
              <Route element={<DoctorOnlyRoute />}>
                <Route path="schedule-edit" element={<ScheduleEditor />} />
                <Route path="patients" element={<div>Сторінка пацієнтів</div>} />
              </Route>

              {/* ОНОВЛЕНО: Маршрути для адміна */}
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

          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
