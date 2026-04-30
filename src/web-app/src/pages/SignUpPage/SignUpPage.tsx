import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ДОДАНО useNavigate
import { useSignUp } from "../../domains/users/useSignUp/useSignUp.ts";
import type { SignUpRequest, Role } from "../../domains/users/types.ts";
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import "./SignUpPage.css";

export default function RegistrationPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("PATIENT");
  const { mutate, isPending } = useSignUp();
  const navigate = useNavigate(); // Ініціалізуємо навігацію

  const onSubmit = (data: any) => {
    // Беремо тільки email та password (confirmPassword для бекенду не потрібен)
    const { email, password } = data;

    // Формуємо об'єкт строго за інтерфейсом SignUpRequest
    const requestData: SignUpRequest = {
      email: email,
      password: password,
      role: selectedRole,
      isActive: true, // Обов'язкове поле
      profile: {
        fullName: "", // Можна додати інпути для цих полів пізніше
        phone: "",
        specializationId: "",
        avatarUrl: ""
      }
    };

    // Відправляємо запит
    mutate(requestData, {
      onSuccess: () => {
        // Якщо реєстрація успішна — перекидаємо на сторінку входу
        navigate("/login");
      }
    });
  };

  return (
    <div className="registration-wrapper">
      <Form<any>
        onSubmit={onSubmit}
        title="Реєстрація"
        subtitle="Доєднайся до платформи"
      >
        {({ watch }) => (
          <>
            <div className="role-selector">
              <p className="role-label">Виберіть вашу роль</p>
              <div className="role-options">
                <div
                  className={`role-option ${selectedRole === "PATIENT" ? "active" : ""}`}
                  onClick={() => setSelectedRole("PATIENT")}
                >
                  <div className="radio-circle"></div>
                  <span>Пацієнт</span>
                </div>
                <div
                  className={`role-option ${selectedRole === "DOCTOR" ? "active" : ""}`}
                  onClick={() => setSelectedRole("DOCTOR")}
                >
                  <div className="radio-circle"></div>
                  <span>Лікар</span>
                </div>
              </div>
            </div>

            <TextInput
              name="email"
              label="Електронна адреса"
              type="email"
              placeholder="Введіть email"
              rules={{
                required: "Введіть email",
                pattern: { value: /^\S+@\S+$/i, message: "Некоректний email" }
              }}
            />

            <TextInput
              name="password"
              label="Пароль"
              type="password"
              placeholder="••••••••••••"
              rules={{
                required: "Введіть пароль",
                minLength: { value: 6, message: "Мінімум 6 символів" }
              }}
            />

            <TextInput
              name="confirmPassword"
              label={
                watch("confirmPassword") && watch("password") !== watch("confirmPassword")
                  ? "ПАРОЛІ НЕ ЗБІГАЮТЬСЯ"
                  : "Підтвердіть пароль"
              }
              type="password"
              placeholder="••••••••••••"
              className={
                watch("confirmPassword") && watch("password") !== watch("confirmPassword")
                  ? "input-error"
                  : ""
              }
              rules={{
                required: "Підтвердіть пароль",
                validate: (val: string) => {
                  if (watch('password') !== val) {
                    return "Паролі не збігаються";
                  }
                },
              }}
            />

            <div className="terms-container">
              <input type="checkbox" id="terms" required />
              <label htmlFor="terms">
                Погоджуюсь з <Link to="/terms">Умовами послуг</Link>
              </label>
            </div>

            <div className="form-footer">
              <Button
                variant="primary"
                type="submit"
                className="w-full"
                disabled={isPending}
              >
                {isPending ? "Реєстрація..." : "Зареєструватись"}
              </Button>
              <div className="back-to-login">
                Вже маєте акаунт? <Link to="/login">Увійти</Link>
              </div>
            </div>
          </>
        )}
      </Form>
    </div>
  );
}
