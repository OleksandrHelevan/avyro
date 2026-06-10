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

    // Формуємо повідомлення, як ви просили
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
    <div className="pfm-overlay">
      <div className="pfm-modal">
        <div className="pfm-header">
          <h3>Зворотний зв'язок</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="pfm-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={32}
                className={star <= (hoverRating || rating) ? "star-active" : "star-inactive"}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>

          <textarea
            placeholder="Ваш відгук про сервіс..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <button type="submit" disabled={isPending}>
            {isPending ? <Loader2 className="spin" /> : <Send size={18}/>}
            Надіслати
          </button>
        </form>
      </div>
    </div>
  );
}
