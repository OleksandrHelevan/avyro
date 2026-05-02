// LoginPage.tsx
import type { LoginRequest } from "../../domains/users/types.ts";
import { useLogin } from "../../domains/users/useLogin/useLogin.ts";
import { Link, useNavigate } from "react-router-dom";
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import toast from "react-hot-toast";
import './LoginPage.css';
import { setInStorage } from "../../utils/localStorageUtil";

export default function LoginPage() {
  const { mutate, isPending } = useLogin();
  const navigate = useNavigate();

  const onSubmit = (data: LoginRequest) => {
    mutate(data, {
      onSuccess: (response: any) => {
        const token = response?.accessToken || response?.token;
        if (token) {
          setInStorage("accessToken", token);
          setInStorage("userRole", response?.role);
          setInStorage("userId", response?.userId || response?.id);
          toast.success("Вхід успішний!");
          navigate("/");
        }
      },
      onError: () => toast.error("Невірний логін або пароль")
    });
  };

  return (
    <>
      {/* ФОНОВІ ЕЛЕМЕНТИ */}
      <div className="bright-gradient-bg"></div>
      <div className="light-blob blob-1"></div>
      <div className="light-blob blob-2"></div>
      <div className="floating-icons-container">
        <div className="bg-icon icon-heart"></div>
        <div className="bg-icon icon-cross"></div>
        <div className="bg-icon icon-pill"></div>
        <div className="bg-icon icon-heart2"></div>
        <div className="bg-icon icon-plus"></div>
      </div>

      <div className="wrapper">
        <Form<LoginRequest>
          onSubmit={onSubmit}
          title="Вхід в Avyro"
          subtitle="Авторизуйтесь..."
          formProps={{
            mode: "onChange",
            defaultValues: { email: "", password: "" }
          }}
        >
          {({ watch }) => {
            // ПІДПИСКА НА МАСИВ ПОЛІВ — це ключовий момент для миттєвої реакції
            const [emailValue, passwordValue] = watch(["email", "password"]);

            // Перевірка: чи обидва поля мають текст (без пробілів)
            const canSubmit = !!emailValue?.trim() && !!passwordValue?.trim();

            return (
              <>
                <TextInput
                  name="email"
                  label="Електронна пошта"
                  type="email"
                  placeholder="doctor@avyro.com"
                  rules={{ required: "Введіть email" }}
                />

                <TextInput
                  name="password"
                  label="Пароль"
                  type="password"
                  placeholder="••••••••"
                  rules={{ required: "Введіть пароль" }}
                />

                <div className="form-footer">
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-full"
                    // Тепер кнопка СТАНЕ СІРОЮ миттєво, якщо ти видалиш хоч один символ
                    disabled={isPending || !canSubmit}
                  >
                    {isPending ? "Вхід..." : "Увійти"}
                  </Button>

                  <div className="sign-up-flow">
                    <p>Нема акаунту?</p>
                    <Link to="/sign-up">Зареєструватись</Link>
                  </div>
                </div>
              </>
            );
          }}
        </Form>
      </div>
    </>
  );
}
