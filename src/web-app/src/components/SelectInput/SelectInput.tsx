import {type ChangeEvent, type ReactNode} from "react";
import "./SelectInput.css";

interface Option {
  value: string | number;
  label: string;
}

interface SelectInputProps {
  label: string;
  options: Option[];
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
}

export default function SelectInput({
                                      label,
                                      options,
                                      value,
                                      onChange,
                                      placeholder = "Оберіть...",
                                      icon,
                                      className = "",
                                    }: SelectInputProps) {

  return (
    <div className={`form-field ${className}`}>
      <label className="form-label">{label}</label>

      <div className="input-wrapper">
        {icon && <div className="input-icon-svg">{icon}</div>}

        <select
          value={value}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
          className={`custom-select ${icon ? "has-icon" : ""}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
