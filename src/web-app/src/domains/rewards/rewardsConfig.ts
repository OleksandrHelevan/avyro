import {UserCheck, Star, ShieldCheck, Award} from "lucide-react";

export type RewardLevel = 'beginner' | 'medium' | 'premium';

export const REWARD_LEVELS: Record<RewardLevel, { min: number; max: number; title: string }> = {
  beginner: { min: 0, max: 100, title: 'Початківець' },
  medium: { min: 101, max: 1000, title: 'Досвідчений пацієнт' },
  premium: { min: 1001, max: 99999, title: 'Преміум користувач' },
};

export const REWARDS_METADATA: Record<string, any> = {
  PROFILE_BONUS: {
    Icon: UserCheck, color: '#4ADE80', glow: 'rgba(74,222,128,0.45)', glow2: 'rgba(74,222,128,0.12)',
    bgColor: 'rgba(74,222,128,0.15)', btn1: '#16a34a', btn2: '#059669',
    blob1: '#4ADE80', blob2: '#064e3b', label: 'Заповнення профілю',
    confetti: ['#4ADE80','#86efac','#bbf7d0','#fff','#a7f3d0'],
  },
  FIRST_VISIT: {
    Icon: Star, color: '#FBBF24', glow: 'rgba(251,191,36,0.45)', glow2: 'rgba(251,191,36,0.12)',
    bgColor: 'rgba(251,191,36,0.15)', btn1: '#d97706', btn2: '#b45309',
    blob1: '#f59e0b', blob2: '#7c2d12', label: 'Перший візит',
    confetti: ['#FBBF24','#fde68a','#fef3c7','#fff','#fcd34d'],
  },
  APPOINTMENT_COMPLETED: {
    Icon: ShieldCheck, color: '#60A5FA', glow: 'rgba(96,165,250,0.45)', glow2: 'rgba(96,165,250,0.12)',
    bgColor: 'rgba(96,165,250,0.15)', btn1: '#2563eb', btn2: '#1d4ed8',
    blob1: '#3b82f6', blob2: '#1e3a5f', label: 'Успішний прийом',
    confetti: ['#60A5FA','#93c5fd','#bfdbfe','#fff','#dbeafe'],
  },
  DEFAULT: {
    Icon: Award, color: '#A78BFA', glow: 'rgba(167,139,250,0.45)', glow2: 'rgba(167,139,250,0.12)',
    bgColor: 'rgba(167,139,250,0.15)', btn1: '#7c3aed', btn2: '#6d28d9',
    blob1: '#8b5cf6', blob2: '#2e1065', label: 'Досягнення',
    confetti: ['#A78BFA','#c4b5fd','#ede9fe','#fff','#ddd6fe'],
  },
};
