import { motion } from "framer-motion";
import { Award, Star, Zap, Shield, Heart, Activity, Calendar, Trophy, Clock } from "lucide-react";
import "./RewardBadge.css";

// Словник винагород: перекладаємо системні ключі від бекенду в юзер-френдлі UI
export const REWARD_DICTIONARY: Record<string, { title: string; description: string; icon: any; color: string; bg: string }> = {
  PROFILE_BONUS: {
    title: "Перший крок",
    description: "Нараховано за повне заповнення особистого профілю.",
    icon: Star,
    color: "#10b981", // Смарагдовий
    bg: "#d1fae5",
  },
  APPOINTMENTS_10: {
    title: "Надійний старт",
    description: "Ви здійснили 10 записів через нашу систему. Чудовий початок!",
    icon: Shield,
    color: "#3b82f6", // Синій
    bg: "#dbeafe",
  },
  APPOINTMENTS_100: {
    title: "Амбасадор здоров'я",
    description: "100 успішних записів! Ваше здоров'я в надійних руках.",
    icon: Trophy,
    color: "#eab308", // Золотий
    bg: "#fef08a",
  },
  SAME_DOCTOR_3: {
    title: "Довіра та відданість",
    description: "3 візити до одного й того самого лікаря. Ви знайшли свого спеціаліста!",
    icon: Heart,
    color: "#ec4899", // Рожевий
    bg: "#fce7f3",
  },
  SAME_SPEC_5: {
    title: "Фокус на здоров'ї",
    description: "5 візитів до лікарів однієї спеціалізації. Продовжуйте піклуватися про себе!",
    icon: Activity,
    color: "#0ea5e9", // Блакитний
    bg: "#e0f2fe",
  },
  MONTHLY_10: {
    title: "Супер-активний місяць",
    description: "10 записів протягом одного календарного місяця. Неймовірна активність!",
    icon: Zap,
    color: "#f97316", // Помаранчевий
    bg: "#ffedd5",
  },
  HALF_YEAR_3_VISITS: {
    title: "Півроку разом",
    description: "Ви з нами вже 6 місяців і здійснили 3 візити. Дякуємо за довіру!",
    icon: Clock,
    color: "#8b5cf6", // Фіолетовий
    bg: "#ede9fe",
  },
  ONE_YEAR_5_VISITS: {
    title: "Рік з нами",
    description: "Вітаємо з першою річницею! 1 рік та 5 завершених візитів.",
    icon: Calendar,
    color: "#d946ef", // Фуксія
    bg: "#fae8ff",
  },
  TWO_YEARS_10_VISITS: {
    title: "Почесний пацієнт",
    description: "2 роки разом і 10 завершених візитів. Ви — наша справжня гордість!",
    icon: Award,
    color: "#6366f1", // Індиго
    bg: "#e0e7ff",
  },
};

export default function RewardBadge({ item, index }: { item: any; index: number }) {
  // Шукаємо налаштування для отриманого source, якщо немає — показуємо дефолтний
  const config = REWARD_DICTIONARY[item.source] || {
    title: "Спеціальний бонус",
    description: "Нагорода за активність у нашій системі.",
    icon: Star,
    color: "#64748b",
    bg: "#f1f5f9",
  };

  const IconComponent = config.icon;

  return (
    <motion.div
      className="reward-badge-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <div className="rb-icon-wrapper" style={{ backgroundColor: config.bg, color: config.color }}>
        <IconComponent size={28} strokeWidth={2.5} />
      </div>
      <div className="rb-content">
        <h4 className="rb-title">{config.title}</h4>
        <p className="rb-desc">{config.description}</p>
      </div>
      <div className="rb-points" style={{ color: config.color }}>
        +{item.points}
      </div>
    </motion.div>
  );
}
