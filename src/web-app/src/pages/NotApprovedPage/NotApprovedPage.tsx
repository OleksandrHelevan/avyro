import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { useQueryClient } from "@tanstack/react-query";
import { useCheckDoctorStatus } from "../../domains/users/useCheckDoctorStatus/useCheckDoctorStatus.tsx";
import './NotApprovedPage.css';
import {useAuth} from "../../context/auth/useAuth.tsx";

export default function NotApprovedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const savedEmail = localStorage.getItem("savedDoctorEmail");
  const { data: statusResponse } = useCheckDoctorStatus(savedEmail);

  useEffect(() => {
    const isApproved = statusResponse?.isPending === false || statusResponse?.isAuthenticated === true;

    if (savedEmail && isApproved) {
      navigate('/login', { replace: true });
    }
  }, [statusResponse, savedEmail, navigate]);

  const handleCheckStatus = () => {
    queryClient.invalidateQueries({ queryKey: ["doctorStatus"] });
    window.location.reload();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="not-approved-viewport aero-viewport light-theme">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-not-approved"></div>
      </div>

      <div className="not-approved-content">
        <div className="glass-card-not-approved profile-card glass-light">
          <div className="status-icon-container">
            <Clock size={80} className="pulse-icon-teal" />
          </div>

          <h1 className="status-title">Ваш акаунт на перевірці</h1>
          <p className="status-description">
            Доступ до кабінету лікаря з'явиться одразу після того, як адміністратор
            підтвердить вашу кваліфікацію. Зазвичай це займає до 24 годин.
          </p>

          <div className="status-actions">
            <button
              onClick={handleCheckStatus}
              className="btn-check-status glow-effect"
            >
              <RefreshCw size={18} />
              <span>Перевірити статус</span>
            </button>

            <button
              onClick={handleLogout}
              className="btn-logout-minimal"
            >
              <LogOut size={16} />
              Вийти з акаунту
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
