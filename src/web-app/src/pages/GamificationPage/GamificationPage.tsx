import  { useMemo } from "react";
import { Link } from "react-router-dom";
import { User, Star, Zap, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth.tsx";
import { usePatient } from "../../domains/users/usePatient/usePatient.ts";
import Loader from "../../components/Loader/Loader.tsx";
import {REWARD_LEVELS, type RewardLevel,} from "../../domains/rewards/rewardsConfig.ts";
import "./GamificationPage.css"
import RewardBadge from "./components/RewardBadge.tsx";

export default function GamificationPage() {
  const { userId } = useAuth();
  const { data: patient, isLoading } = usePatient(userId || "");

  // Рахуємо тотал поінтів
  const totalPoints = useMemo(() => {
    if (!patient?.rewards) return 0;
    return patient.rewards.reduce((sum, item) => sum + item.points, 0);
  }, [patient]);

  // Визначаємо поточний рівень
  const currentLevelInfo = useMemo(() => {
    const levelKey = (Object.keys(REWARD_LEVELS) as RewardLevel[]).find(
      key => totalPoints >= REWARD_LEVELS[key].min && totalPoints <= REWARD_LEVELS[key].max
    ) || 'beginner';

    return {
      key: levelKey,
      ...REWARD_LEVELS[levelKey]
    };
  }, [totalPoints]);

  // Прогрес бар до наступного рівня
  const progressPercentage = useMemo(() => {
    const { min, max } = currentLevelInfo;
    const range = max - min;
    const current = totalPoints - min;
    return Math.min(100, Math.max(0, (current / range) * 100));
  }, [totalPoints, currentLevelInfo]);

  if (isLoading) return <div className="loading-screen"><Loader/></div>;

  return (
    <div className="aero-viewport light-theme gamification-page">
      {/* Декоративні елементи на фоні */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="layout-container main-content">
        <aside className="sidebar">
          <div className="sidebar-menu glass-light slide-in-left">
            <Link to="/profile" className="menu-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <User size={18} /> Особисті дані
            </Link>
            <button className="menu-item active">
              <Star size={18} strokeWidth={2.5} /> Досягнення та Бали
            </button>
          </div>
        </aside>

        <main className="profile-content">
          <div className="page-header fade-in-down">
            <h1>Ваші досягнення</h1>
            <p>Заробляйте бали за активність та отримуйте бонуси</p>
          </div>

          {/* Карточка Тотал Поінтів */}
          <div className="total-points-card glass-light pop-in">
            <div className="points-info">
              <span className="points-label"><Zap size={20} color="#F59E0B" /> Загальний баланс</span>
              <h2 className="points-value">
                {totalPoints} <span className="points-currency">балів</span>
              </h2>
            </div>

            <div className="level-info">
              <div className="level-header">
                <span className="current-level-title"><TrendingUp size={16}/> Рівень: {currentLevelInfo.title}</span>
                <span className="next-level-target">{currentLevelInfo.max} балів</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <h3 className="section-title fade-in-up">Історія нагород</h3>

          <div className="badges-grid">
            {patient?.rewards && patient.rewards.length > 0 ? (
              patient.rewards.map((reward, idx) => (
                <RewardBadge key={reward._id} item={reward} index={idx} />
              ))
            ) : (
              <div className="empty-rewards fade-in-up">
                У вас поки немає нагород. Заповніть профіль, щоб отримати перші бали!
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
