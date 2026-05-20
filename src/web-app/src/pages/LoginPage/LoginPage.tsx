import { useState, useEffect } from "react";
import type { LoginRequest } from "../../domains/users/types.ts";
import { useLogin } from "../../domains/users/useLogin/useLogin.ts";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import toast from "react-hot-toast";

import "./LoginPage.css";
import { useAuth } from "../../AuthContext.tsx";
import { apiClient } from "../../services/apiService.ts";
import { clearFromStorage, getFromStorage } from "../../utils/localStorageUtil.ts";

export default function LoginPage() {
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isChecking, setIsChecking] = useState(true);
  const [defaultEmail, setDefaultEmail] = useState("");

  // 1. АВТО-ПЕРЕВІРКА ПРИ ЗАВАНТАЖЕННІ (після реєстрації)
  useEffect(() => {
    const checkDoctorFlow = async () => {
      const savedEmail = getFromStorage<string>("savedDoctorEmail");

      if (!savedEmail) {
        setIsChecking(false);
        return;
      }

      setDefaultEmail(savedEmail);

      try {
        const res = await apiClient.get<any>(`/doctors?email=${encodeURIComponent(savedEmail)}`);

        if (res?.data?.isPending === true || res?.data?.isAuthenticated === false) {
          toast.error("Ваш акаунт ще знаходиться на перевірці.");
          navigate("/not-approved"); // ✅ Тут правильно
          return;
        }
      } catch (error) {
        console.log("Помилка автоперевірки", error);
      }

      setIsChecking(false);
    };

    checkDoctorFlow();
  }, [navigate]);

  // 2. ПЕРЕВІРКА ПРИ НАТИСКАННІ КНОПКИ (Якщо лікар вводить дані вручну)
  const onSubmit = async (data: LoginRequest) => {
    let isDoctorPending = false;
    let isDoctorNotAuthenticated = false;

    try {
      const doctorStatusRes = await apiClient.get<any>(`/doctors?email=${encodeURIComponent(data.email)}`);

      if (doctorStatusRes && doctorStatusRes.data) {
        isDoctorPending = doctorStatusRes.data.isPending === true;
        isDoctorNotAuthenticated = doctorStatusRes.data.isAuthenticated === false;
      }
    } catch (e) {
      console.log("Користувач не є лікарем або помилка сервера, йдемо далі.");
    }

    // 🚀 ВИПРАВЛЕНО ТУТ: тепер при ручному вводі теж редіректить на ВІДКРИТИЙ роут
    if (isDoctorPending || isDoctorNotAuthenticated) {
      toast.error("Ваш акаунт лікаря ще знаходиться на перевірці.");
      navigate("/not-approved"); // ✅ Тепер перенаправляє куди треба!
      return;
    }

    // 3. Звичайний логін (тільки для approved лікарів та пацієнтів)
    mutate(data, {
      onSuccess: (response: any) => {
        const token = response?.accessToken || response?.token;
        const role = response?.role;

        if (token) {
          login(token, role, response?.userId || response?.id);
          clearFromStorage("savedDoctorEmail"); // Чистимо сторедж

          if (role === "DOCTOR") {
            navigate("/profile"); // Для апрувнутого лікаря /profile - це ок, бо токен вже є
          } else {
            navigate("/");
          }
        }
      },
      onError: (error: any) => {
        const errorCode = error?.response?.data?.errorCode;
        if (errorCode === "INVALID_CREDENTIALS") {
          toast.error("Невірний логін або пароль");
        } else {
          toast.error("Помилка входу. Спробуйте пізніше");
        }
      },
    });
  };

  if (isChecking) {
    return (
      <div className="login-page">
        <div className="loading-screen">Перевірка статусу акаунта...</div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <Form<LoginRequest>
          onSubmit={onSubmit}
          title="Вхід в Avyro"
          subtitle="Авторизуйтесь"
          defaultValues={{ email: defaultEmail, password: "" }}
          className="login-form"
        >
          {() => (
            <>
              <TextInput
                name="email"
                label="Електронна пошта"
                type="email"
                placeholder="Введіть email"
                rules={{
                  required: "Email обов'язковий",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Некоректний email" },
                }}
              />

              <TextInput
                name="password"
                label="Пароль"
                type="password"
                placeholder="••••••••"
                rules={{
                  required: "Пароль обов'язковий",
                  minLength: { value: 6, message: "Пароль має бути мінімум 6 символів" },
                }}
              />

              <div className="login-form-footer">
                <Button variant="primary" type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Вхід..." : "Увійти"}
                </Button>

                <div className="sign-up-flow">
                  <p>Нема акаунту?</p>
                  <Link to="/sign-up">Зареєструватись</Link>
                </div>
              </div>
            </>
          )}
        </Form>
      </div>
    </div>
  );
}
