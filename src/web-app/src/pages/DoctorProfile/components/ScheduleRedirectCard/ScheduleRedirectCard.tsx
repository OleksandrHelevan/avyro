import { useNavigate } from "react-router-dom";
import { Calendar as CalendarIcon } from "lucide-react";

import "./ScheduleRedirectCard.css";
import Button from "../../../../components/Button/Button.tsx";

interface ScheduleRedirectCardProps {
  title?: string;
  description?: string;
  buttonText?: string;
  redirectTo?: string;
  className?: string;
}

export default function ScheduleRedirectCard({
                                               title = "Генерація розкладу",
                                               description = "Налаштуйте робочі години та тривалість прийомів",
                                               buttonText = "Мій графік",
                                               redirectTo = "/schedule-edit",
                                               className = "",
                                             }: ScheduleRedirectCardProps) {
  const navigate = useNavigate();

  return (
    <div className={`schedule-redirect-card ${className}`}>
      <div className="redirect-info">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <Button
        variant="outline"
        type="button"
        className="btn-redirect-schedule"
        onClick={() => navigate(redirectTo)}
      >
        <CalendarIcon size={18} strokeWidth={2.5} />
        <span>{buttonText}</span>
      </Button>
    </div>
  );
}
