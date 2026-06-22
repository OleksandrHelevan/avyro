import { useParams, useNavigate, useLocation } from "react-router-dom";
import { User, ArrowLeft, MapPin, Phone, Mail, Award, Stethoscope, Calendar, Star, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/auth/useAuth.tsx";
import { useDoctor } from "../../domains/users/useDoctor/useDoctor.ts";
import { usePatient } from "../../domains/users/usePatient/usePatient.ts";
import Loader from "../../components/Loader/Loader.tsx";
import "./PublicProfilePage.css";
import DoctorFeedbackForm from "../DoctorFeedbackForm/DoctorFeedbackForm.tsx";

import { useGetDoctorReviews } from "../../domains/users/useGetDoctorReviews/useGetDoctorReviews.ts";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=User&background=f1f5f9&color=475569&size=256";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDoctor: currentUserIsDoctor, isPatient: currentUserIsPatient } = useAuth();

  const isViewingDoctor = location.pathname.includes("/doctors/");

  const { data: docData, isLoading: isLoadingDoc } = useDoctor(isViewingDoctor ? id || "" : "");
  const { data: patData, isLoading: isLoadingPat } = usePatient(!isViewingDoctor ? id || "" : "");

  const { data: reviews = [], isLoading: isLoadingReviews } = useGetDoctorReviews(isViewingDoctor ? id || "" : "");

  const isLoading = isLoadingDoc || isLoadingPat;
  const userToView: any = isViewingDoctor ? (docData as any)?.data || docData : patData;

  if (isLoading) return <div className="loading-screen"><Loader /></div>;

  if (!userToView) {
    return (
      <div className="pub-prof-error">
        <h2>Користувача не знайдено</h2>
        <button onClick={() => navigate(-1)}>Повернутися назад</button>
      </div>
    );
  }

  const fullName = userToView.fullName || userToView.full_name || "Невідомий користувач";
  const avatarUrl = userToView.avatarUrl || userToView.avatar_url || DEFAULT_AVATAR;
  const email = userToView.email;
  const phone = userToView.phone;
  const address = userToView.address;
  const specName = userToView.specializationName || userToView.specialization_name;
  const points = userToView.rewards?.reduce((acc: number, r: any) => acc + r.points, 0) || 0;

  return (
    <div className="pub-prof-page">
      <div className="pub-prof-bg">
        <div className="pub-prof-blob blob-1"></div>
        <div className="pub-prof-blob blob-2"></div>
        <div className="pub-prof-blur-overlay"></div>
      </div>

      <div className="pub-prof-container">
        <button className="pub-prof-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> <span>Повернутися</span>
        </button>

        <div className="pub-prof-card glass-panel">
          <div className="pub-prof-header">
            <div className="pub-prof-avatar-ring">
              <img src={avatarUrl} alt={fullName} className="pub-prof-avatar" onError={(e) => (e.currentTarget.src = DEFAULT_AVATAR)} />
              {isViewingDoctor && (
                <div className="pub-prof-badge" title="Перевірений спеціаліст">
                  <Award size={16} color="white" />
                </div>
              )}
            </div>

            <div className="pub-prof-title-section">
              <h1 className="pub-prof-name">{fullName}</h1>
              {isViewingDoctor ? (
                <div className="pub-prof-tag doctor-tag">
                  <Stethoscope size={16} /> {specName || "Спеціаліст"}
                </div>
              ) : (
                <div className="pub-prof-tag patient-tag">
                  <User size={16} /> Пацієнт платформи
                </div>
              )}
            </div>
          </div>

          <div className="pub-prof-divider" />

          <div className="pub-prof-info-grid">
            {phone && (
              <div className="pub-prof-info-item">
                <div className="pub-info-icon"><Phone size={18} /></div>
                <div className="pub-info-text">
                  <span className="pub-info-label">Телефон</span>
                  <a href={`tel:${phone}`} className="pub-info-val link">{phone}</a>
                </div>
              </div>
            )}

            {email && (
              <div className="pub-prof-info-item">
                <div className="pub-info-icon"><Mail size={18} /></div>
                <div className="pub-info-text">
                  <span className="pub-info-label">Email</span>
                  <a href={`mailto:${email}`} className="pub-info-val link">{email}</a>
                </div>
              </div>
            )}

            {address && !isViewingDoctor && (
              <div className="pub-prof-info-item">
                <div className="pub-info-icon"><MapPin size={18} /></div>
                <div className="pub-info-text">
                  <span className="pub-info-label">Адреса</span>
                  <span className="pub-info-val">{address}</span>
                </div>
              </div>
            )}

            {!isViewingDoctor && currentUserIsDoctor && points > 0 && (
              <div className="pub-prof-info-item">
                <div className="pub-info-icon highlight-icon"><Award size={18} /></div>
                <div className="pub-info-text">
                  <span className="pub-info-label">Рейтинг довіри</span>
                  <span className="pub-info-val">{points} балів активності</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {isViewingDoctor && currentUserIsPatient && (
          <DoctorFeedbackForm doctorId={id || ""} />
        )}

        {isViewingDoctor && currentUserIsPatient && (
          <div className="pub-prof-action-card glass-panel fade-up">
            <div className="pub-action-content">
              <h3>Бажаєте записатись на прийом?</h3>
              <p>Перегляньте вільні години та оберіть зручний час для візиту.</p>
            </div>
            <button className="pub-book-btn glow-effect" onClick={() => navigate(`/doctor/${id}`)}>
              <Calendar size={18} /> Записатись
            </button>
          </div>
        )}

        {isViewingDoctor && (
          <div className="doctor-reviews-section fade-up">
            <h3 className="reviews-section-title">Відгуки пацієнтів</h3>

            {isLoadingReviews ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
                <Loader />
              </div>
            ) : reviews.length === 0 ? (
              <div className="no-reviews glass-panel">
                <MessageSquare size={32} color="#cbd5e1" />
                <p>Ще немає відгуків про цього лікаря. Будьте першим!</p>
              </div>
            ) : (
              <div className="reviews-list">
                {reviews.map((review: any, index: number) => (
                  <div key={index} className="review-card glass-panel">
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={16}
                          fill={star <= (review.rating || 5) ? "#f59e0b" : "transparent"}
                          stroke={star <= (review.rating || 5) ? "#f59e0b" : "#cbd5e1"}
                        />
                      ))}
                    </div>
                    <p className="review-text">"{review.message || review}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
