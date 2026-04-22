import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import SignUpPage from './pages/SignUpPage/SignUpPage.tsx';
import RootLayout from "./layouts/RootLayout/RootLayout.tsx";
import {QueryClientProvider} from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import {queryClient} from "./services/queryClient.ts";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="bottom-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="sign-up" element={<SignUpPage />} />
          </Route>
          <Route path="*" element={<div>Сторінку не знайдено (404)</div>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
