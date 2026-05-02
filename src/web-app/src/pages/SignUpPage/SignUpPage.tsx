import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUp } from "../../domains/users/useSignUp/useSignUp.ts";
import type { SignUpRequest, Role } from "../../domains/users/types.ts";
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import "./SignUpPage.css";

export default function RegistrationPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("PATIENT");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { mutate, isPending } = useSignUp();
  const navigate = useNavigate();

  const onSubmit = (data: any) => {
    const { email, password } = data;

    const requestData: SignUpRequest = {
      email: email,
      password: password,
      role: selectedRole,
      isActive: true,
      profile: {
        fullName: "",
        phone: "",
        specializationId: "",
        avatarUrl: ""
      }
    };

    mutate(requestData, {
      onSuccess: () => {
        navigate("/login");
      }
    });
  };

  return (
    <>
      {/* ДИНАМІЧНИЙ ФОН */}
      <div className="bright-gradient-bg"></div>
      <div className="light-blob blob-1"></div>
      <div className="light-blob blob-2"></div>

      {/* ПЛАВАЮЧІ ІКОНКИ */}
      <div className="floating-icons-container">
        <div className="bg-icon icon-heart"></div>
        <div className="bg-icon icon-cross"></div>
        <div className="bg-icon icon-pill"></div>
        <div className="bg-icon icon-heart2"></div>
        <div className="bg-icon icon-plus"></div>
      </div>

      {/* САМА ФОРМА */}
      <div className="registration-wrapper">
        <Form<any>
          onSubmit={onSubmit}
          title="Реєстрація"
          subtitle="Доєднайся до платформи"
        >
          {({ watch }) => {
            const email = watch("email");
            const password = watch("password");
            const confirmPassword = watch("confirmPassword");

            // ПЕРЕВІРКА ОБМЕЖЕНЬ: email, довжина пароля, збіг паролів та чекбокс
            const isEmailValid = email && /^\S+@\S+\.\S+$/.test(email);
            const isPasswordValid = password && password.length >= 6;
            const isConfirmValid = confirmPassword && confirmPassword === password;

            const isFormValid = isEmailValid && isPasswordValid && isConfirmValid && termsAccepted;

            return (
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
                    confirmPassword && password !== confirmPassword
                      ? "ПАРОЛІ НЕ ЗБІГАЮТЬСЯ"
                      : "Підтвердіть пароль"
                  }
                  type="password"
                  placeholder="••••••••••••"
                  rules={{
                    required: "Підтвердіть пароль",
                    validate: (val: string) => {
                      if (password !== val) {
                        return "Паролі не збігаються";
                      }
                    },
                  }}
                />

                <div className="terms-container">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    Погоджуюсь з <Link to="/terms">Умовами послуг</Link>
                  </label>
                </div>

                <div className="form-footer">
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-full"
                    disabled={isPending || !isFormValid} // Кнопка активна тільки при дотриманні всіх умов
                  >
                    {isPending ? "Реєстрація..." : "Зареєструватись"}
                  </Button>
                  <div className="back-to-login">
                    Вже маєте акаунт? <Link to="/login">Увійти</Link>
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
