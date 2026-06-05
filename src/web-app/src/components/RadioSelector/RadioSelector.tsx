import "./RadioSelector.css"

export interface RadioOption<T extends string> {
  value: T;
  label: string;
}

interface RadioSelectorProps<T extends string> {
  options: readonly RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
}

export function RadioSelector<T extends string>({
                                                  options,
                                                  value,
                                                  onChange,
                                                  label,
                                                  className = "",
                                                }: RadioSelectorProps<T>) {
  return (
    <div className={`role-selector ${className}`}>
      {label && <p className="role-label">{label}</p>}

      <div className="role-options">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <div
              key={option.value}
              className={`role-option ${active ? "active" : ""}`}
              onClick={() => onChange(option.value)}
            >
              <div className="radio-circle"/>
              <span>{option.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
