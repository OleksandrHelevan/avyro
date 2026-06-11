import { motion } from "framer-motion";
import { Star, MessageSquare, Calendar, User } from "lucide-react";
import { useGetAllFeedback } from "../../domains/users/useGetAllFeedback/useGetAllFeedback.ts";
import Loader from "../../components/Loader/Loader.tsx";
import "./AdminFeedbacksPage.css";

export default function AdminFeedbacksPage() {
  const { data: feedbacks = [], isLoading, isError } = useGetAllFeedback();

  if (isLoading) return <div className="admin-fb-loader"><Loader /></div>;
  if (isError) return <div className="admin-fb-error">Помилка при завантаженні відгуків.</div>;

  const formatDate = (dateString: string) => {
    if (!dateString) return "Дата невідома";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="admin-fb-page">
      <div className="admin-fb-header">
        <h1>Відгуки платформи</h1>
        <p>Керування та перегляд усіх відгуків користувачів</p>
      </div>

      {feedbacks.length === 0 ? (
        <div className="admin-fb-empty glass-panel">
          <MessageSquare size={48} color="#cbd5e1" />
          <p>Наразі відгуків немає.</p>
        </div>
      ) : (
        <div className="admin-fb-grid">
          {feedbacks.map((fb: any, index: number) => (
            <motion.div
              key={fb.id || fb._id || index}
              className="admin-fb-card glass-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="fb-card-header">
                <div className="fb-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={18}
                      fill={star <= (fb.rating || 0) ? "#f59e0b" : "transparent"}
                      stroke={star <= (fb.rating || 0) ? "#f59e0b" : "#cbd5e1"}
                    />
                  ))}
                </div>
                <span className={`fb-visibility ${fb.visibility?.toLowerCase()}`}>
                  {fb.visibility === 'PUBLIC' ? 'Публічний' : 'Прихований'}
                </span>
              </div>

              <div className="fb-card-body">
                <p className="fb-message">"{fb.message || "Без тексту"}"</p>
              </div>

              <div className="fb-card-footer">
                <div className="fb-meta">
                  <User size={14} />
                  <span>{fb.doctor_id ? "Відгук про лікаря" : "Загальний відгук"}</span>
                </div>
                <div className="fb-meta">
                  <Calendar size={14} />
                  <span>{formatDate(fb.createdAt || fb.created_at)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
