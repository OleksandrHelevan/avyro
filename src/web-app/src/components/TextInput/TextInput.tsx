import { useFormContext, useFormState } from "react-hook-form";
import { useEffect, useState } from "react";
import "./TextInput.css";
import {EyeIcon, EyeOffIcon} from "lucide-react";

interface TextInputProps {
  name: string;
  label: string;
  type?: "text" | "password" | "tel" | "email";
  placeholder?: string;
  rules?: object;
  hint?: string;
}

export default function TextInput({
                                    name,
                                    label,
                                    type = "text",
                                    placeholder,
                                    rules,
                                    hint,
                                  }: TextInputProps) {
  const { register, control } = useFormContext();

  const { errors, isSubmitted, submitCount } = useFormState({
    control,
    name,
  });

  const error = errors[name];
  const showError = isSubmitted && !!error;

  const [shake, setShake] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === "password";

  const inputType =
    isPasswordField && showPassword ? "text" : type;

  useEffect(() => {
    if (showError) {
      setShake(false);

      const restart = setTimeout(() => {
        setShake(true);
      }, 10);

      const cleanup = setTimeout(() => {
        setShake(false);
      }, 410);

      return () => {
        clearTimeout(restart);
        clearTimeout(cleanup);
      };
    }
  }, [submitCount]);

  return (
    <div className="form-field">
      <label className="form-label" htmlFor={name}>
        {label}
      </label>

      <div className={shake ? "shake" : ""}>
        <div className="input-wrapper">
          <input
            {...register(name, rules)}
            id={name}
            type={inputType}
            placeholder={placeholder}
            className={`form-input ${showError ? "input-error" : ""} ${
              isPasswordField ? "password-input" : ""
            }`}
          />

          {isPasswordField && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          )}

        </div>

        {showError && (
          <span className="form-error" role="alert">
            {error?.message as string}
          </span>
        )}

        {!showError && hint && (
          <span className="form-hint">{hint}</span>
        )}
      </div>
    </div>
  );
}
