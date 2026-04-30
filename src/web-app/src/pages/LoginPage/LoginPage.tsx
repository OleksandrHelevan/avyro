import type {LoginRequest} from "../../domains/users/types.ts";
import {useLogin} from "../../domains/users/useLogin/useLogin.ts";
import {Link, useNavigate} from "react-router-dom"; // Додали useNavigate
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import './LoginPage.css'

export default function LoginPage() {
  const {mutate, isPending} = useLogin();
  const navigate = useNavigate(); // Ініціалізуємо навігацію

  const onSubmit = (data: LoginRequest) => {
    mutate(data, {
      onSuccess: (response) => {
        // ТУТ ВАЖЛИВИЙ МОМЕНТ:
        // Якщо твій хук useLogin САМ не зберігає токен у localStorage,
        // то це треба зробити тут. Наприклад:
        // localStorage.setItem("med_token", response.accessToken);

        // Перекидаємо на головну сторінку
        navigate("/");
      },
      onError: (error) => {
        // Тут можна додати toast з помилкою, якщо логін не вдався
        console.error("Помилка логіну:", error);
      }
    });
  };

  return (
    <div className="wrapper">
      <Form<LoginRequest>
        onSubmit={onSubmit}
        title="Вхід в Avyro"
        subtitle="Авторизуйтесь, щоб продовжити роботу"
      >
        {() => (
          <>
            <TextInput
              name="email"
              label="Електронна пошта"
              type="email"
              placeholder="doctor@avyro.com"
              rules={{
                required: "Введіть email",
                pattern: {value: /^\S+@\S+$/i, message: "Некоректний email"}
              }}
            />

            <TextInput
              name="password"
              label="Пароль"
              type="password"
              placeholder="••••••••"
              rules={{required: "Введіть пароль", minLength: {value: 6, message: "Мін. 6 символів"}}}
            />
            <div className="form-footer">
              <Button variant="primary" type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Вхід..." : "Увійти"}
              </Button>
              <div className={"sign-up-flow"}>
                <p>Нема акаунту?</p>
                <Link to={"/sign-up"}>Зареєструватись</Link>
              </div>
            </div>

          </>
        )}
      </Form>
    </div>
  );
}
