import { Trophy, X } from 'lucide-react';
import toast, {type Toast} from 'react-hot-toast';

interface BadgeUnlockToastProps {
  t: Toast;
  title: string;
  points: number;
}

export default function BadgeUnlockToast({ t, title, points }: BadgeUnlockToastProps) {
  return (
    <div
      className={`${
        t.visible ? 'animate-toast-enter' : 'animate-toast-leave'
      } custom-badge-toast`}
    >
      <div className="toast-icon-container">
        <Trophy size={24} color="#FBBF24" />
      </div>
      <div className="toast-content">
        <p className="toast-subtitle">Нове досягнення!</p>
        <p className="toast-title">{title}</p>
        <span className="toast-points">+{points} балів</span>
      </div>
      <button onClick={() => toast.dismiss(t.id)} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
}
