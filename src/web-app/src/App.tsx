import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

// --- СТОРІНКИ ---
import HomePage from './pages/HomePage/HomePage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.tsx';
import PatientProfile from "./pages/PatientProfile/PatientProfile.tsx";
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile.tsx";
import DoctorProfilePage from "./pages/DoctorProfilePage/DoctorProfilePage.tsx"; // Сторінка перегляду для пацієнтів
import ScheduleEditor from "./pages/ScheduleEditor/ScheduleEditor.tsx";
import NotApprovedPage from "./pages/NotApprovedPage/NotApprovedPage.tsx";
import NotFound from "./pages/NotFound/NotFound.tsx";
import AdminSchedules from "./pages/AdminSchedules/AdminSchedules.tsx";
import AdminRequests from "./pages/AdminRequests/AdminRequests.tsx";
import AdminNotifications from "./pages/AdminNotifications/AdminNotifications.tsx";

// ДОДАНО: Імпорт нової сторінки записів пацієнта
import PatientAppointmentsPage from "./pages/PatientAppointmentsPage/PatientAppointmentsPage.tsx";

// --- ЛЕЙАУТ ТА СЕРВІСИ ---
import RootLayout from "./layouts/RootLayout/RootLayout.tsx";
import { queryClient } from "./services/queryClient.ts";
import { useDoctor } from "./domains/users/useDoctor/useDoctor";

interface DoctorData {
  status?: string;
  isApproved?: boolean;
  isActive?: boolean;
}

// --- ДИСПЕТЧЕР ПРОФІЛІВ (Власний кабінет) ---
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

// --- ОСНОВНИЙ КОМПОНЕНТ APP ---
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

            {/* Захищені маршрути (тільки для авторизованих) */}
            <Route element={<ProtectedRoute />}>
              <Route index element={<HomePage />} />

              {/* Перегляд профілю конкретного лікаря (для пацієнтів) */}
              <Route path="doctor/:id" element={<DoctorProfilePage />} />

              {/* === НОВА СТОРІНКА: Мої записи (для пацієнтів) === */}
              <Route path="appointments" element={<PatientAppointmentsPage />} />

              {/* Власний профіль (Диспетчер) */}
              <Route path="profile" element={<ProfileDispatcher />} />

              {/* Маршрути тільки для активованих лікарів */}
              <Route element={<DoctorOnlyRoute />}>
                <Route path="schedule-edit" element={<ScheduleEditor />} />
                <Route path="patients" element={<div>Сторінка пацієнтів</div>} />
              </Route>

              {/* Маршрути тільки для адміністратора */}
              <Route element={<AdminRoute />}>
                <Route path="admin/requests" element={<AdminRequests />} />
                <Route path="admin/specializations" element={<AdminNotifications />} />
                <Route path="admin/schedules" element={<AdminSchedules />} />
              </Route>
            </Route>

            {/* Публічні маршрути (тільки для неавторизованих) */}
            <Route element={<PublicRoute />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="sign-up" element={<SignUpPage />} />
            </Route>

          </Route>

          {/* 404 сторінка */}
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
