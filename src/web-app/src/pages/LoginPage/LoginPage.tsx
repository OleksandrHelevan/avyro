import type { LoginRequest } from "../../domains/users/types.ts";
import { useLogin } from "../../domains/users/useLogin/useLogin.ts";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import toast from "react-hot-toast";

// ДОДАНО: Імпорт AuthContext замість setInStorage
import "./LoginPage.css";
import {useAuth} from "../../AuthContext.tsx";

export default function LoginPage() {
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();

  // ДОДАНО: беремо функцию login з контексту
  const { login } = useAuth();

  const onSubmit = (data: LoginRequest) => {
    mutate(data, {
      onSuccess: (response: any) => {
        const token = response?.accessToken || response?.token;

        if (token) {
          // ВИКОРИСТОВУЄМО КОНТЕКСТ ДЛЯ ЗБЕРЕЖЕННЯ
          login(token, response?.role, response?.userId || response?.id);
          navigate("/");
        }
      },
      onError: () => toast.error("Невірний логін або пароль"),
    });
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <Form<LoginRequest>
          onSubmit={onSubmit}
          title="Вхід в Avyro"
          subtitle="Авторизуйтесь"
          defaultValues={{ email: "", password: "" }}
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
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Некоректний email",
                  },
                }}
              />

              <TextInput
                name="password"
                label="Пароль"
                type="password"
                placeholder="••••••••"
                rules={{
                  required: "Пароль обов'язковий",
                  minLength: {
                    value: 6,
                    message: "Пароль має бути мінімум 6 символів",
                  },
                }}
              />

              <div className="login-form-footer">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-full"
                  disabled={isPending}
                >
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
