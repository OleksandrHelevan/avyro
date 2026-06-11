import { useState } from "react";
import "./DoctorFeedbackForm.css";
import { useCreateFeedback } from "../../domains/users/useCreateFeedbackDoc/useCreateFeedbackDoc";
import { Star, Send, Loader2, MessageSquare, X } from "lucide-react";

interface DoctorFeedbackFormProps {
  doctorId: string;
}

export default function DoctorFeedbackForm({ doctorId }: DoctorFeedbackFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");

  const { mutate: submitFeedback, isPending } = useCreateFeedback();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !message.trim()) return;

    submitFeedback({
      doctor_id: doctorId,
      message: message.trim(),
      rating: Number(rating),
      visibility: "PUBLIC",
    });

    setIsOpen(false);
    setRating(0);
    setMessage("");
  };

  if (!isOpen) {
    return (
      <button
        className="open-feedback-btn glow-effect"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={18} /> Залишити відгук про лікаря
      </button>
    );
  }

  return (
    <div className="feedback-form-container glass-panel fade-up">
      <div className="feedback-header">
        <h3>Ваш відгук</h3>
        <button
          type="button"
          className="close-btn"
          onClick={() => setIsOpen(false)}
          title="Закрити"
        >
          <X size={20} />
        </button>
      </div>

      <p className="feedback-desc">
        Поділіться своїми враженнями від прийому. Це допоможе іншим пацієнтам зробити правильний вибір.
      </p>

      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="rating-section">
          <span className="rating-label">Оцініть лікаря:</span>
          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${
                  (hoverRating || rating) >= star ? "active" : ""
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <Star
                  size={32}
                  strokeWidth={1.5}
                  fill={
                    (hoverRating || rating) >= star
                      ? "#f59e0b"
                      : "transparent"
                  }
                  stroke={
                    (hoverRating || rating) >= star
                      ? "#f59e0b"
                      : "#cbd5e1"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div className="message-section">
          <textarea
            placeholder="Опишіть ваші враження (що сподобалося, чи був лікар уважним)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="submit-feedback-btn"
          disabled={isPending || rating === 0}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="spin" /> Відправка...
            </>
          ) : (
            <>
              <Send size={18} /> Надіслати відгук
            </>
          )}
        </button>
      </form>
    </div>
  );
}
