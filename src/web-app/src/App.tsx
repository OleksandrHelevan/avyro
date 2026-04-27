import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.tsx';
import RootLayout from "./layouts/RootLayout/RootLayout.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { queryClient } from "./services/queryClient.ts";

// --- КОМПОНЕНТИ-ОБГОРТКИ ДЛЯ МАРШРУТІВ ---

// 1. Захищений маршрут (тільки для тих, хто увійшов)
const ProtectedRoute = () => {
  // ЗМІНЕНО: тепер шукаємо accessToken, як на твоєму скриншоті
  const token = localStorage.getItem("accessToken");

  // Якщо токена немає, перекидаємо на логін
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  // Якщо є — рендеримо дочірні компоненти (наприклад, HomePage)
  return <Outlet />;
};

// 2. Публічний маршрут (щоб залогінений юзер не міг зайти на сторінку логіну)
const PublicRoute = () => {
  // ЗМІНЕНО: тепер шукаємо accessToken
  const token = localStorage.getItem("accessToken");

  // Якщо юзер вже має токен, кидаємо його на головну
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
        <Routes>
          <Route path="/" element={<RootLayout />}>

            {/* ЗАХИЩЕНІ СТОРІНКИ */}
            <Route element={<ProtectedRoute />}>
              <Route index element={<HomePage />} />
              {/* Тут можна додавати інші захищені сторінки, наприклад /profile */}
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
