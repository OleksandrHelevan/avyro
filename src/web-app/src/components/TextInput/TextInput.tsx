import { useFormContext } from "react-hook-form";
import "./TextInput.css";

interface TextInputProps {
    name: string;
    label: string;
    type?: "text" | "password" | "tel" | "email";
    placeholder?: string;
    rules?: object;
}

export default function TextInput({ name, label, type = "text", placeholder, rules }: TextInputProps) {
    const { register, formState: { errors } } = useFormContext();

    const error = errors[name];

    return (
        <div className="form-field">
            <label className="form-label" htmlFor={name}>
                {label}
            </label>
            <input
                {...register(name, rules)}
                id={name}
                type={type}
                placeholder={placeholder}
                className={`form-input ${error ? "input-error" : ""}`}
            />
            {error && (
                <span className="form-error">
                    {error.message as string}
                </span>
            )}
        </div>
    );
}