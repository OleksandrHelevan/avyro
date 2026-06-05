import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";

import {
  HOME_PATH, NOT_APPROVED_PATH, NOT_FOUND_PATH,
  LOGIN_PATH, SIGNUP_PATH,
  DOCTOR_PROFILE_PATH, APPOINTMENTS_PATH, PROFILE_PATH,
  SCHEDULE_EDIT_PATH, PATIENTS_PATH,
  ADMIN_REQUESTS_PATH, ADMIN_SPECIALIZATIONS_PATH, ADMIN_SCHEDULES_PATH,
  GAMIFICATION_PATH,
  ADMIN_NOTIFICATIONS_PATH, WALLET_PATH
} from "./router/routes.ts"

import HomePage from '../pages/HomePage/HomePage.tsx';
import LoginPage from '../pages/LoginPage/LoginPage.tsx';
import SignUpPage from '../pages/SignUpPage/SignUpPage.tsx';
import DoctorProfilePage from "../pages/DoctorProfilePage/DoctorProfilePage.tsx";
import ScheduleEditor from "../pages/ScheduleEditor/ScheduleEditor.tsx";
import NotApprovedPage from "../pages/NotApprovedPage/NotApprovedPage.tsx";
import NotFound from "../pages/NotFound/NotFound.tsx";
import AdminSchedules from "../pages/AdminSchedules/AdminSchedules.tsx";
import AdminRequests from "../pages/AdminRequests/AdminRequests.tsx";
import AdminNotifications from "../pages/AdminNotifications/AdminNotifications.tsx";
import PatientAppointmentsPage from "../pages/PatientAppointmentsPage/PatientAppointmentsPage.tsx";
import DoctorAppointmentsPage from "../pages/DoctorAppointmentsPage/DoctorAppointmentsPage.tsx"; // 🚀 ДОДАНО ІМПОРТ
import GamificationPage from "../pages/GamificationPage/GamificationPage.tsx";
import AdminSendNotification from "../pages/AdminSendNotification/AdminSendNotification.tsx";

import RootLayout from "../layouts/RootLayout/RootLayout.tsx";
import { queryClient } from "../services/queryClient.ts";
import MainApprovalInterceptor from "./router/guards/MainApprovalInterceptor.tsx";
import PublicRoute from "./router/guards/PublicRoute.tsx";
import ProtectedRoute from "./router/guards/ProtectedRoute.tsx";
import ProfileDispatcher from "./router/dispatchers/ProfileDispatcher.tsx";
import AdminRoute from "./router/guards/AdminRoute.tsx";
import { AuthProvider } from "../context/auth/AuthProvider.tsx";
import WalletPage from "../pages/WalletPage/WalletPage.tsx";
import AppointmentDetailPage from "../pages/AppointmentDetailPage/AppointmentDetailPage.tsx";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path={HOME_PATH} element={<RootLayout />}>
              <Route path={NOT_APPROVED_PATH} element={<NotApprovedPage />} />

              <Route element={<MainApprovalInterceptor />}>

                <Route element={<PublicRoute />}>
                  <Route path={LOGIN_PATH} element={<LoginPage />} />
                  <Route path={SIGNUP_PATH} element={<SignUpPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route index element={<HomePage />} />
                  <Route path={WALLET_PATH} element={<WalletPage />} />
                  <Route path={GAMIFICATION_PATH} element={<GamificationPage />} />
                  <Route path={DOCTOR_PROFILE_PATH} element={<DoctorProfilePage />} />

                  {/* Записи для пацієнта */}
                  <Route path={APPOINTMENTS_PATH} element={<PatientAppointmentsPage />} />

                  {/* 🚀 ДОДАНО: Записи для лікаря */}
                  <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />

                  {/* Спільна сторінка деталей запису (працює і для лікаря, і для пацієнта) */}
                  <Route path="/appointments/:id" element={<AppointmentDetailPage />} />

                  <Route path={PROFILE_PATH} element={<ProfileDispatcher />} />

                  <Route path={SCHEDULE_EDIT_PATH} element={<ScheduleEditor />} />
                  <Route path={PATIENTS_PATH} element={<div>Сторінка пацієнтів</div>} />

                  <Route element={<AdminRoute />}>
                    <Route path={ADMIN_REQUESTS_PATH} element={<AdminRequests />} />
                    <Route path={ADMIN_SPECIALIZATIONS_PATH} element={<AdminNotifications />} />
                    <Route path={ADMIN_SCHEDULES_PATH} element={<AdminSchedules />} />
                    <Route path={ADMIN_NOTIFICATIONS_PATH} element={<AdminSendNotification />} />
                  </Route>
                </Route>

              </Route>
            </Route>

            <Route path={NOT_FOUND_PATH} element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
