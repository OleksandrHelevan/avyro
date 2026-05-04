import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle, ChevronLeft } from 'lucide-react';
import './NotFound.css';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-viewport">
      {/* Фон з вашими оригінальними кольорами блобів */}
      <div className="bright-gradient-bg">
        <div className="light-blob blob-404-1"></div>
        <div className="light-blob blob-404-2"></div>
      </div>

      <div className="not-found-container">
        <div className="glass-card-404">
          <div className="error-code">404</div>
          <div className="error-icon-wrapper">
            <AlertCircle size={64} className="pulse-icon" />
          </div>

          <h1 className="error-title">Сторінку не знайдено</h1>
          <p className="error-text">
            На жаль, за цією адресою нічого немає. Можливо, ви помилилися в посиланні
            або сторінку було перенесено.
          </p>

          <div className="not-found-actions">
            <button onClick={() => navigate(-1)} className="btn-secondary-aero">
              <ChevronLeft size={18} />
              Назад
            </button>
            <button onClick={() => navigate('/')} className="btn-primary-aero">
              <Home size={18} />
              На головну
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
