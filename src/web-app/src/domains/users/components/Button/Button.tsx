import type { ButtonHTMLAttributes, ReactNode } from "react";
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children?: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
    className?: string;
}

export default function Button({
                                   children,
                                   type = 'button',
                                   variant = 'primary',
                                   className = '',
                                   disabled,
                                   ...props
                               }: ButtonProps) {
    const getVariantClass = () => {
        switch (variant) {
            case 'primary': return 'btn-primary';
            case 'secondary': return 'btn-secondary';
            case 'outline': return 'btn-outline';
            case 'danger': return 'btn-danger';
            case 'ghost': return 'btn-ghost';
            default: return 'btn-primary';
        }
    }

    return (
        <button
            type={type}
            className={`btn ${getVariantClass()} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}