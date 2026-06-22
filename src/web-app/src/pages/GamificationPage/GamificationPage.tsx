import { useMemo, useEffect, useRef } from "react";
import { Zap, TrendingUp } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth.tsx";
import { usePatient } from "../../domains/users/usePatient/usePatient.ts";
import Loader from "../../components/Loader/Loader.tsx";
import { REWARD_LEVELS, type RewardLevel } from "../../domains/rewards/rewardsConfig.ts";
import PatientSidebar from "../../components/PatientSidebar/PatientSidebar.tsx";
import RewardBadge, { REWARD_DICTIONARY } from "./components/RewardBadge.tsx";
import BadgeUnlockToast from "./components/BadgeUnlockToast.tsx";
import toast from "react-hot-toast";
import "./GamificationPage.css";

export default function GamificationPage() {
  const { userId } = useAuth();
  const { data: patient, isLoading } = usePatient(userId || "");

  const prevRewardsCount = useRef<number>(0);

  const totalPoints = useMemo(() => {
    if (!patient?.rewards) return 0;
    return patient.rewards.reduce((sum, item) => sum + item.points, 0);
  }, [patient]);

  useEffect(() => {
    if (patient?.rewards) {
      const currentCount = patient.rewards.length;

      if (currentCount > prevRewardsCount.current && prevRewardsCount.current !== 0) {
        const newRewards = patient.rewards.slice(prevRewardsCount.current);

        newRewards.forEach((reward: any) => {
          const config = REWARD_DICTIONARY[reward.source] || { title: "Спеціальний бонус" };

          toast.custom((t) => (
            <BadgeUnlockToast t={t} title={config.title} points={reward.points} />
          ), { duration: 5000 });
        });
      }

      prevRewardsCount.current = currentCount;
    }
  }, [patient?.rewards]);

  const currentLevelInfo = useMemo(() => {
    const levelKey =
      (Object.keys(REWARD_LEVELS) as RewardLevel[]).find(
        (key) => totalPoints >= REWARD_LEVELS[key].min && totalPoints <= REWARD_LEVELS[key].max
      ) || "beginner";
    return { key: levelKey, ...REWARD_LEVELS[levelKey] };
  }, [totalPoints]);

  const progressPercentage = useMemo(() => {
    const { min, max } = currentLevelInfo;
    return Math.min(100, Math.max(0, ((totalPoints - min) / (max - min)) * 100));
  }, [totalPoints, currentLevelInfo]);

  if (isLoading) return <div className="loading-screen"><Loader /></div>;

  return (
    <div className="aero-viewport light-theme gamification-page">
      <div className="bg-shape shape-1" />
      <div className="bg-shape shape-2" />

      <div className="layout-container main-content">
        <PatientSidebar />

        <main className="profile-content">
          <div className="page-header fade-in-down">
            <h1>Ваші досягнення</h1>
            <p>Заробляйте бали за активність та отримуйте бонуси</p>
          </div>

          <div className="total-points-card glass-light pop-in">
            <div className="points-info">
              <span className="points-label"><Zap size={20} color="#F59E0B" /> Загальний баланс</span>
              <h2 className="points-value">{totalPoints} <span className="points-currency">балів</span></h2>
            </div>
            <div className="level-info">
              <div className="level-header">
                <span className="current-level-title"><TrendingUp size={16} /> Рівень: {currentLevelInfo.title}</span>
                <span className="next-level-target">{currentLevelInfo.max} балів</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
          </div>

          <h3 className="section-title fade-in-up">Історія нагород</h3>

          <div className="badges-grid">
            {patient?.rewards && patient.rewards.length > 0 ? (
              [...patient.rewards].reverse().map((reward, idx) => (
                <RewardBadge key={reward._id || idx} item={reward} index={idx} />
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
