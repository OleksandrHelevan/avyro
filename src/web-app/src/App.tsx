import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.tsx';
import RootLayout from "./layouts/RootLayout/RootLayout.tsx";
import PatientProfile from "./pages/PatientProfile/PatientProfile.tsx";
import DoctorProfile from "./pages/DoctorProfile/DoctorProfile.tsx";
import ScheduleEditor from "./pages/ScheduleEditor/ScheduleEditor.tsx"; // 1. Імпортуємо новий компонент
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./services/queryClient.ts";
import NotFound from "./pages/NotFound/NotFound.tsx";

// --- ДИСПЕТЧЕР ПРОФІЛІВ ---
const ProfileDispatcher = () => {
  const role = localStorage.getItem("userRole")?.replace(/"/g, '');
  if (role === "DOCTOR") return <DoctorProfile />;
  return <PatientProfile />;
};

// --- КОМПОНЕНТИ-ОБГОРТКИ ДЛЯ МАРШРУТІВ ---

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

// 2. Спеціальна обгортка для маршрутів, доступних тільки лікарям
const DoctorOnlyRoute = () => {
  const role = localStorage.getItem("userRole")?.replace(/"/g, '');

  if (role !== "DOCTOR") {
    // Якщо не лікар — відправляємо на головну або профіль
    return <Navigate to="/profile" replace />;
  }
  return <Outlet />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>

            {/* ЗАХИЩЕНІ СТОРІНКИ */}
            <Route element={<ProtectedRoute />}>
              <Route index element={<HomePage />} />
              <Route path="profile" element={<ProfileDispatcher />} />

              {/* 3. ДОДАЄМО МАРШРУТ ДЛЯ РЕДАКТОРА ГРАФІКА */}
              <Route element={<DoctorOnlyRoute />}>
                <Route path="schedule-edit" element={<ScheduleEditor />} />
              </Route>
            </Route>

            {/* ПУБЛІЧНІ СТОРІНКИ */}
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
