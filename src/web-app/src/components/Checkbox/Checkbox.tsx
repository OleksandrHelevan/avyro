import "./Checkbox.css"

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  label: React.ReactNode;
  className?: string;
}

export default function Checkbox({
                                   id,
                                   checked,
                                   onChange,
                                   label,
                                   className = "",
                                 }: CheckboxProps) {
  return (
    <div className={`checkbox-container ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />

      <label htmlFor={id}>{label}</label>
    </div>
  );
}
