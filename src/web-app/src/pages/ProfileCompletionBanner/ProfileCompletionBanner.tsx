import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, UserRound, Phone, MapPin, Camera } from "lucide-react";
import "./ProfileCompletionBanner.css";

interface Field {
  key: keyof ProfileData;
  label: string;
  Icon: any;
}

interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  avatarUrl?: string;
}

const FIELDS: Field[] = [
  { key: "firstName",  label: "Ім'я",       Icon: UserRound },
  { key: "lastName",   label: "Прізвище",   Icon: UserRound },
  { key: "phone",      label: "Телефон",    Icon: Phone     },
  { key: "address",    label: "Адреса",     Icon: MapPin    },
  { key: "avatarUrl",  label: "Фото",       Icon: Camera    },
];

interface Props {
  profile: ProfileData;
}

export default function ProfileCompletionBanner({ profile }: Props) {
  const navigate = useNavigate();

  const missing = FIELDS.filter((f) => !profile[f.key]?.toString().trim());
  const filled  = FIELDS.length - missing.length;
  const pct     = Math.round((filled / FIELDS.length) * 100);

  // All done — hide banner
  if (missing.length === 0) return null;

  return (
    <div className="pcb-banner">
      <div className="pcb-left">
        <div className="pcb-icon-wrap">
          <Sparkles size={20} />
        </div>
        <div className="pcb-text">
          <div className="pcb-title">
            {filled === 0
              ? "Заповніть профіль, щоб отримати перший бейдж"
              : "Майже готово! Заповніть решту даних для бонусу"}
          </div>
          <div className="pcb-missing-chips">
            {missing.map(({ key, label, Icon }) => (
              <span key={key} className="pcb-chip">
                <Icon size={11} />
                {label}
              </span>
            ))}
          </div>
          <div className="pcb-progress-wrap">
            <div className="pcb-progress-track">
              <div className="pcb-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="pcb-pct">{pct}%</span>
          </div>
        </div>
      </div>
      <button className="pcb-cta" onClick={() => navigate("/profile")}>
        Заповнити <ArrowRight size={14} />
      </button>
    </div>
  );
}
