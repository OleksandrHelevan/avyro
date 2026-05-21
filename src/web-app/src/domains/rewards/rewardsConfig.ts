import { UserCheck, Star, Award,  ShieldCheck } from "lucide-react";

export type RewardLevel = 'beginner' | 'medium' | 'premium';

export interface RewardMetadata {
  icon: any;            // Компонент іконки Lucide
  borderColor: string;  // Колір рамки/світіння
  bgColor: string;      // Колір фону
  badgeType: 'basic' | 'special' | 'epic';
  label: string;
}

// Рівні та необхідна кількість балів
export const REWARD_LEVELS: Record<RewardLevel, { min: number; max: number; title: string }> = {
  beginner: { min: 0, max: 100, title: 'Початківець' },
  medium: { min: 101, max: 1000, title: 'Досвідчений пацієнт' },
  premium: { min: 1001, max: 99999, title: 'Преміум користувач' },
};

// Метадані для кожного типу ревардса (ключі мають збігатися з полем `source` або `type` з бекенду)
export const REWARDS_METADATA: Record<string, RewardMetadata> = {
  PROFILE_BONUS: {
    icon: UserCheck,
    borderColor: "#4ADE80", // Зелений
    bgColor: "rgba(74, 222, 128, 0.1)",
    badgeType: "basic",
    label: "Заповнення профілю"
  },
  FIRST_VISIT: {
    icon: Star,
    borderColor: "#FBBF24", // Золотий
    bgColor: "rgba(251, 191, 36, 0.1)",
    badgeType: "special",
    label: "Перший візит"
  },
  APPOINTMENT_COMPLETED: {
    icon: ShieldCheck,
    borderColor: "#60A5FA", // Синій
    bgColor: "rgba(96, 165, 250, 0.1)",
    badgeType: "basic",
    label: "Успішний прийом"
  },
  // Дефолтний бейдж, якщо бекенд пришле щось нове
  DEFAULT: {
    icon: Award,
    borderColor: "#A78BFA", // Фіолетовий
    bgColor: "rgba(167, 139, 250, 0.1)",
    badgeType: "basic",
    label: "Досягнення"
  }
};
