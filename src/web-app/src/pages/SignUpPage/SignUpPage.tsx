import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSignUp } from "../../domains/users/useSignUp/useSignUp.ts";
import type { SignUpRequest, Role } from "../../domains/users/types.ts";
import TextInput from "../../components/TextInput/TextInput.tsx";
import Button from "../../components/Button/Button.tsx";
import Form from "../../components/Form/Form.tsx";
import {
  type RadioOption,
  RadioSelector,
} from "../../components/RadioSelector/RadioSelector.tsx";
import "./SignUpPage.css";
import Checkbox from "../../components/Checkbox/Checkbox.tsx";
import toast from "react-hot-toast";

interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("PATIENT");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { mutate, isPending } = useSignUp();
  const navigate = useNavigate();

  const roleOptions: RadioOption<Role>[] = [
    { value: "PATIENT", label: "Пацієнт" },
    { value: "DOCTOR", label: "Лікар" },
  ];

  const onSubmit = (data: SignUpFormValues) => {
    if (!termsAccepted) {
      toast.error("Потрібно погодитись з умовами");
      return;
    }

    const requestData: SignUpRequest = {
      email: data.email,
      password: data.password,
      role: selectedRole,
      isActive: true,
      profile: {
        fullName: "",
        phone: "",
        specializationId: "",
        avatarUrl: "",
      },
    };

    mutate(requestData, {
      onSuccess: () => {
        toast.success("Акаунт створено!");
        navigate("/login");
      },
      onError: () => {
        toast.error("Помилка реєстрації");
      },
    });
  };

  return (
    <div className="signup-page">
      <div className="signup-wrapper">
        <Form<SignUpFormValues>
          onSubmit={onSubmit}
          title="Реєстрація"
          subtitle="Доєднайся до платформи"
          className="signup-form"
          defaultValues={{
            email: "",
            password: "",
            confirmPassword: "",
          }}
        >
          {({ watch }) => {
            const password = watch("password");

            return (
              <>
                <RadioSelector<Role>
                  label="Виберіть вашу роль"
                  options={roleOptions}
                  value={selectedRole}
                  onChange={setSelectedRole}
                />

                <TextInput
                  name="email"
                  label="Електронна адреса"
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
                      message: "Мінімум 6 символів",
                    },
                  }}
                />

                <TextInput
                  name="confirmPassword"
                  label="Підтвердження пароля"
                  type="password"
                  placeholder="••••••••"
                  rules={{
                    required: "Підтвердіть пароль",
                    validate: (value: string) =>
                      value === password || "Паролі не збігаються",
                  }}
                />

                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onChange={setTermsAccepted}
                  label={
                    <>
                      Погоджуюсь з{" "}
                      <Link to="/terms">Умовами послуг</Link>
                    </>
                  }
                />

                <div className="signup-form-footer">
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-full"
                    disabled={isPending || !termsAccepted}
                  >
                    {isPending
                      ? "Реєстрація..."
                      : "Зареєструватись"}
                  </Button>

                  <div className="back-to-login">
                    Вже маєте акаунт?{" "}
                    <Link to="/login">Увійти</Link>
                  </div>
                </div>
              </>
            );
          }}
        </Form>
      </div>
    </div>
  );
}
