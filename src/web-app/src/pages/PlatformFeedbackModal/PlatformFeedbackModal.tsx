import { useState } from "react";
import { Star, Send, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import "./PlatformFeedbackModal.css";
import {useCreateFeedback} from "../../domains/users/useCreateFeedback/useCreateFeedback.ts";

interface Props {
  onClose: () => void;
}

export default function PlatformFeedbackModal({ onClose }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState("");

  const { mutate: sendFeedback, isPending } = useCreateFeedback();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Оберіть оцінку!");
      return;
    }

    sendFeedback(
      {
        doctorId: "platform",
        data: {
          rating,
          message: message.trim(),
          source: "PLATFORM"
        }
      }, // <--- ТУТ була зайва дужка! Об'єкт параметрів закривається тут.
      {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          toast.error("Помилка відправки. Спробуйте пізніше.");
        }
      }
    );
  };

  return (
    <div className="pfm-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pfm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="pfm-header">
          <h3>Зворотний зв'язок</h3>
          <button className="pfm-close-btn" onClick={onClose} aria-label="Закрити">
            <X size={20} />
          </button>
        </div>

        <p className="pfm-desc">Допоможіть нам стати кращими!</p>

        <form onSubmit={handleSubmit}>
          <div className="pfm-rating-container">
            <span className="pfm-rating-label">Оцініть наш сервіс:</span>
            <div className="pfm-rating" role="radiogroup">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={36}
                  className={star <= (hoverRating || rating) ? "star-active" : "star-inactive"}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </div>

          <textarea
            className="pfm-textarea"
            placeholder="Ваші враження..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button type="submit" className="pfm-submit-btn" disabled={isPending}>
            {isPending ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
            {isPending ? "Відправка..." : "Надіслати відгук"}
          </button>
        </form>
      </div>
    </div>
  );
}
