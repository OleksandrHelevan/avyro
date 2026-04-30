import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.tsx';
import RootLayout from "./layouts/RootLayout/RootLayout.tsx";
import PatientProfile from "./pages/PatientProfile/PatientProfile.tsx";

// ДОДАНО: Імпорт нашого Хедера (перевір, щоб шлях відповідав твоїй структурі папок)
import Header from "./components/Header/Header.tsx";

import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./services/queryClient.ts";

// --- КОМПОНЕНТИ-ОБГОРТКИ ДЛЯ МАРШРУТІВ ---

// 1. Захищений маршрут (тільки для тих, хто увійшов)
const ProtectedRoute = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// 2. Публічний маршрут (щоб залогінений юзер не міг зайти на сторінку логіну)
const PublicRoute = () => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  if (token) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" />
      <BrowserRouter>

        {/* ДОДАНО: Хедер тепер глобальний і працює для всього додатку */}
        <Header />

        <Routes>
          <Route path="/" element={<RootLayout />}>

            {/* ЗАХИЩЕНІ СТОРІНКИ */}
            <Route element={<ProtectedRoute />}>
              <Route index element={<HomePage />} />
              <Route path="profile" element={<PatientProfile />} />
            </Route>

            {/* ПУБЛІЧНІ СТОРІНКИ */}
            <Route element={<PublicRoute />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="sign-up" element={<SignUpPage />} />
            </Route>

          </Route>

          <Route path="*" element={<div>Сторінку не знайдено (404)</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
