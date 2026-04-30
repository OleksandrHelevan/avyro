import type {LoginRequest} from "../../domains/users/types.ts";
import {useLogin} from "../../domains/users/useLogin/useLogin.ts";
import {Link, useNavigate} from "react-router-dom";
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import './LoginPage.css'

export default function LoginPage() {
  const {mutate, isPending} = useLogin();
  const navigate = useNavigate();

  const onSubmit = (data: LoginRequest) => {
    mutate(data, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (error) => {
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
