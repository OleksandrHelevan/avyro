import React, { useState } from "react";
import { Star, Send, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import "./PlatformFeedbackModal.css";

interface Props {
  onClose: () => void;
}

export default function PlatformFeedbackModal({ onClose }: Props) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Будь ласка, оберіть оцінку!");
      return;
    }

    // Формуємо повідомлення
    const finalMessage = `Оцінка: ${rating} зірочок\nМеседж: ${message}`;

    setIsPending(true);
    // Тут виклик вашого API для фідбеку
    console.log("Відправляємо на бекенд:", finalMessage);

    setTimeout(() => {
      toast.success("Дякуємо за ваш відгук!");
      setIsPending(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="pfm-overlay" onClick={onClose}>
      <div className="pfm-modal" onClick={(e) => e.stopPropagation()}>

        <div className="pfm-header">
          <h3>Зворотний зв'язок</h3>
          <button className="pfm-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p className="pfm-desc">
          Допоможіть нам стати кращими! Поділіться своїми враженнями від використання платформи.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="pfm-rating-container">
            <span className="pfm-rating-label">Оцініть наш сервіс:</span>
            <div className="pfm-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={36}
                  strokeWidth={1.5}
                  className={star <= (hoverRating || rating) ? "star-active" : "star-inactive"}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                />
              ))}
            </div>
          </div>

          <textarea
            className="pfm-textarea"
            placeholder="Що вам сподобалось, а що варто покращити?"
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
