import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import './NotApprovedPage.css';

export default function NotApprovedPage() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
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

          <h1 className="status-title">Ваш аккаунт на перевірці</h1>
          <p className="status-description">
            Доступ до кабінету лікаря з'явиться одразу після того, як адміністратор
            підтвердить вашу кваліфікацію. Зазвичай це займає до 24 годин.
          </p>

          <div className="status-actions">
            <button
              onClick={() => window.location.reload()}
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
              Вийти з аккаунту
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
