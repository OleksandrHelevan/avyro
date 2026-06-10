import { useState } from "react";
import "./DoctorFeedbackForm.css";
import { useCreateFeedback } from "../../domains/users/useCreateFeedback/useCreateFeedback";
import { Star, Send, Loader2, MessageSquare } from "lucide-react";

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

    submitFeedback(
      {
        doctor_id: doctorId,
        message,
        rating,
        visibility: "PUBLIC",
      },
      {
        onSuccess: () => {
          setIsOpen(false);
          setRating(0);
          setMessage("");
        },
      }
    );
  };

  if (!isOpen) {
    return (
      <button
        className="open-feedback-btn glow-effect"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={18} /> Залишити відгук
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
        >
          ×
        </button>
      </div>

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
                  size={28}
                  fill={
                    (hoverRating || rating) >= star
                      ? "#f59e0b"
                      : "transparent"
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          placeholder="Опишіть ваші враження..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button
          type="submit"
          className="submit-feedback-btn"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="spin" /> Відправка...
            </>
          ) : (
            <>
              <Send size={18} /> Надіслати
            </>
          )}
        </button>
      </form>
    </div>
  );
}
