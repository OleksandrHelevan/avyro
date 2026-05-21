import { useState, useEffect } from "react";
import type { LoginRequest } from "../../domains/users/types.ts";
import { useLogin } from "../../domains/users/useLogin/useLogin.ts";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import toast from "react-hot-toast";

import "./LoginPage.css";
import { apiClient } from "../../services/apiClient.ts";
import { clearFromStorage, getFromStorage, setInStorage } from "../../utils/localStorageUtil.ts";
import {useAuth} from "../../context/auth/useAuth.tsx";

export default function LoginPage() {
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [isChecking, setIsChecking] = useState(true);
  const [defaultEmail, setDefaultEmail] = useState("");

  // 1. АВТО-ПЕРЕВІРКА ПРИ ЗАВАНТАЖЕННІ
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

        // 🚀 ФІКС: Витягуємо лікаря з масиву, якщо бекенд повернув масив
        const doctorData = Array.isArray(res.data) ? res.data[0] : (res.data?.items?.[0] || res.data);

        // Перевіряємо різні можливі варіанти статусу PENDING від бекенда
        if (doctorData?.isPending === true || doctorData?.status === "PENDING" || doctorData?.status === "WAITING") {
          navigate("/not-approved");
          return;
        }

      } catch (error) {
        console.log("Помилка автоперевірки", error);
      }

      setIsChecking(false);
    };

    checkDoctorFlow();
  }, [navigate]);

  // 2. ПЕРЕВІРКА ПРИ РУЧНОМУ ВВОДІ (кнопка "Увійти")
  const onSubmit = async (data: LoginRequest) => {
    try {
      const doctorStatusRes = await apiClient.get<any>(`/doctors?email=${encodeURIComponent(data.email)}`);

      // 🚀 ФІКС ТУТ ТАКОЖ: Витягуємо лікаря
      const doctorData = Array.isArray(doctorStatusRes.data) ? doctorStatusRes.data[0] : (doctorStatusRes.data?.items?.[0] || doctorStatusRes.data);

      if (doctorData?.isPending === true || doctorData?.status === "PENDING" || doctorData?.status === "WAITING") {
        setInStorage("savedDoctorEmail", data.email);
        toast.error("Ваш акаунт лікаря ще знаходиться на перевірці.");
        navigate("/not-approved");
        return;
      }
    } catch (e) {
      // Ігноруємо (користувач не знайдений у лікарях, мабуть це пацієнт, йдемо логінитись)
    }

    // 3. ЗВИЧАЙНИЙ ЛОГІН
    mutate(data, {
      onSuccess: (response: any) => {
        const token = response?.accessToken || response?.token;
        const role = response?.role;

        if (token) {
          login(token, role, response?.userId || response?.id);
          clearFromStorage("savedDoctorEmail");

          if (role === "DOCTOR") {
            navigate("/profile");
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
