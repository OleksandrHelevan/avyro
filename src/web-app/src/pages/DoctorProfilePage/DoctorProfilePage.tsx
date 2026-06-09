import { useParams, useNavigate } from "react-router-dom";
import { Mail, CalendarDays, ArrowLeft, CreditCard } from "lucide-react";
import {
  format, isSameDay, isBefore, startOfToday,
  parse, isAfter, getDay, addDays
} from "date-fns";
import { uk } from "date-fns/locale";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import "./DoctorProfilePage.css";
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import { useCreateAppointment } from "../../domains/appointments/useCreateAppointment/useCreateAppointment";
import { usePatient } from "../../domains/users/usePatient/usePatient.ts";
import { useAuth } from "../../context/auth/useAuth.tsx";
import Loader from "../../components/Loader/Loader.tsx";
import TopUpModal from "../../components/WalletModal/TopUpModal.tsx";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Doctor&background=E0E7FF&color=4F46E5&size=128";

const generateTimeSlots = (startTime: string, endTime: string, slotDuration: number) => {
  const slots = [];
  try {
    let current = parse(startTime, "HH:mm", new Date());
    const end = parse(endTime, "HH:mm", new Date());
    if (isNaN(current.getTime()) || isNaN(end.getTime())) return [];
    while (isBefore(current, end)) {
      slots.push(format(current, "HH:mm"));
      current = new Date(current.getTime() + slotDuration * 60000);
    }
  } catch (e) { console.error("Помилка генерації слотів:", e); }
  return slots;
};

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"MONEY" | "POINTS" | "MIXED">("MONEY");

  const { data: rawDoctor, isLoading: isDocLoading } = useDoctor(id || "");
  const { data: patientResponse } = usePatient(userId || "");
  const { mutate: bookAppointment, isPending: isBooking } = useCreateAppointment();

  const doctor = useMemo(() => (rawDoctor as any)?.data || rawDoctor, [rawDoctor]);

  // ── Profile completeness guard ────────────────────────────────────────
  const profileIssues = useMemo(() => {
    if (!patientResponse) return [];
    const issues: string[] = [];
    const rawName = patientResponse.fullName || "";
    const parts = rawName.trim().split(/\s+/);
    if (!parts[0]) issues.push("ім'я");
    if (!parts[1]) issues.push("прізвище");
    if (!patientResponse.phone?.trim()) issues.push("номер телефону");
    return issues;
  }, [patientResponse]);

  // ── Schedule & slots ──────────────────────────────────────────────────
  const activeSchedule = useMemo(() => {
    const schedules = doctor?.schedule;
    if (!Array.isArray(schedules) || schedules.length === 0) return null;
    return [...schedules].reverse().find((s: any) => s.status === "APPROVED") || [...schedules].reverse()[0];
  }, [doctor]);

  const rollingDays = useMemo(() => Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i)), []);

  const availableSlots = useMemo(() => {
    const sd = activeSchedule?.payload?.repeating || activeSchedule?.repeating;
    if (!sd) return [];
    if (!sd.daysOfWeek?.includes(getDay(selectedDate))) return [];
    const all = generateTimeSlots(sd.startTime || sd.start_time, sd.endTime || sd.end_time, sd.slotDuration || sd.slot_duration || 30);
    const now = new Date();
    return all.filter(t => {
      if (!isSameDay(selectedDate, now)) return true;
      return isAfter(parse(t, "HH:mm", selectedDate), now);
    });
  }, [selectedDate, activeSchedule]);

  const selectedSlotData = useMemo(() => {
    if (!selectedTime || !activeSchedule) return null;
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const allSlots = [
      ...(Array.isArray(doctor?.schedule) ? doctor.schedule : []),
      ...(Array.isArray(activeSchedule?.slots) ? activeSchedule.slots : []),
      ...(Array.isArray(activeSchedule?.payload?.slots) ? activeSchedule.payload.slots : []),
    ];
    return allSlots.find((s: any) => {
      const t = String(s.from || "");
      return t.includes(formattedDate) && t.includes(selectedTime) && s.type === "AVAILABLE";
    });
  }, [selectedDate, selectedTime, activeSchedule, doctor]);

  const consultationPrice = useMemo(() => {
    if (!selectedTime) return null;
    if (selectedSlotData?.pricePerSlot || selectedSlotData?.price)
      return selectedSlotData.pricePerSlot || selectedSlotData.price;
    return activeSchedule?.pricePerSlot || activeSchedule?.price
      || activeSchedule?.payload?.pricePerSlot || activeSchedule?.payload?.price
      || doctor?.pricePerSlot || doctor?.price || doctor?.consultationPrice || null;
  }, [selectedSlotData, activeSchedule, selectedTime, doctor]);

  // ── Booking handler ───────────────────────────────────────────────────
  const handleBooking = () => {
    // 🔒 Guard: profile must have name + phone
    if (profileIssues.length > 0) {
      toast.error(
        `Для запису заповніть профіль: ${profileIssues.join(", ")}`,
        {
          duration: 4000,
          icon: "👤",
          style: { maxWidth: 360 },
        }
      );
      return;
    }

    if (!selectedSlotData) {
      toast.error("Цей час вже зайнятий або недоступний.");
      return;
    }

    const slotIdToBook = selectedSlotData.slotId || selectedSlotData.id || selectedSlotData._id;
    const doctorIdToBook = doctor?._id || doctor?.id || id;

    if (!slotIdToBook || !doctorIdToBook) {
      toast.error("Не знайдено ідентифікатор слота або лікаря.");
      return;
    }

    bookAppointment(
      { slotId: slotIdToBook, doctorId: doctorIdToBook, pricePerSlot: consultationPrice, payment_method: paymentMethod } as any,
      {
        onSuccess: (response: any) => {
          const data = response?.data || response;
          const appointmentId = data?._id || data?.id || data?.appointmentId;

          toast.success("Ви успішно записані! 🎉", { duration: 3000 });

          // ✅ Navigate to appointment detail
          if (appointmentId) {
            setTimeout(() => navigate(`/appointments/${appointmentId}`), 800);
          } else {
            setSelectedTime(null);
          }
        },
        onError: (err: any) => {
          const errData = err?.response?.data || {};
          const msg = errData?.message || err?.message || "";
          if (msg.includes("INSUFFICIENT_FUNDS") || err?.response?.status === 402) {
            toast.error("Недостатньо коштів. Поповніть гаманець.");
            setShowTopUpModal(true);
          } else {
            toast.error(msg || "Сталася помилка при записі.");
          }
        },
      }
    );
  };

  if (isDocLoading) return <div className="loading-screen"><Loader /></div>;

  return (
    <div className="booking-page aero-viewport light-theme">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1" /><div className="light-blob blob-2" />
      </div>
      <div className="floating-icons-container">
        <div className="floating-icon icon-1">💙</div>
        <div className="floating-icon icon-2">✨</div>
        <div className="floating-icon icon-3">👨‍⚕️</div>
      </div>

      <div className="booking-wrapper">
        <button className="nav-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Назад
        </button>

        {/* Profile incomplete warning */}
        {profileIssues.length > 0 && (
          <div className="booking-profile-warn">
            <span>⚠️ Для запису потрібно заповнити: <strong>{profileIssues.join(", ")}</strong></span>
            <button onClick={() => navigate("/profile")}>→ Заповнити профіль</button>
          </div>
        )}

        <div className="glass-card profile-info-card">
          <div className="doctor-pfp">
            <img
              src={doctor?.avatarUrl || doctor?.avatar_url || DEFAULT_AVATAR}
              alt="doctor"
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
            />
          </div>
          <div className="doctor-details">
            <h2>{doctor?.fullName || doctor?.full_name || "Спеціаліст"}</h2>
            <p><Mail size={14} /> {doctor?.email || "doctor@avyro.com"}</p>
          </div>
        </div>

        <div className="glass-card booking-card">
          <div className="booking-header">
            <CalendarDays size={22} color="#7b51b3" />
            <h3>Запис на прийом</h3>
          </div>

          {!activeSchedule ? (
            <div className="no-schedule-state">
              <p className="no-schedule-title">У цього спеціаліста наразі немає доступних годин для запису.</p>
              <p className="no-schedule-desc">Не хвилюйтеся! У нас є інші чудові фахівці цього профілю.</p>
              <button className="confirm-booking-btn find-other-doctors-btn" onClick={() => navigate(`/?spec=${encodeURIComponent(doctor?.specializationName || "Усі")}`)}>
                Знайти схожих лікарів
              </button>
            </div>
          ) : (
            <>
              {/* Date selector */}
              <div className="date-selector-section">
                <label>Оберіть дату</label>
                <div className="date-scroll-container">
                  {rollingDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const sd = activeSchedule?.payload?.repeating || activeSchedule?.repeating;
                    const isWorkDay = sd?.daysOfWeek?.includes(getDay(day));
                    return (
                      <button key={day.toString()} className={`date-box ${isSelected ? "active" : ""} ${!isWorkDay ? "disabled" : ""}`}
                              onClick={() => { setSelectedDate(day); setSelectedTime(null); }} disabled={!isWorkDay}>
                        <span className="day-name">{format(day, "EE", { locale: uk })}</span>
                        <span className="day-number">{format(day, "d")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              <div className="time-selector-section">
                <label>Вільні години</label>
                <div className="time-grid">
                  {availableSlots.length > 0 ? (
                    availableSlots.map(time => (
                      <button key={time} className={`time-btn ${selectedTime === time ? "active" : ""}`} onClick={() => setSelectedTime(time)}>
                        {time}
                      </button>
                    ))
                  ) : (
                    <div className="no-hours">На цей день немає вільних годин</div>
                  )}
                </div>
              </div>

              {selectedTime && (
                <div className="price-display">
                  {consultationPrice ? `Вартість прийому: ${consultationPrice} ₴`
                    : <span className="price-error-text">Ціна не вказана для цього часу</span>}
                </div>
              )}

              {/* Payment method */}
              {selectedTime && consultationPrice && (
                <div className="payment-method-section" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", color: "#64748b" }}>
                    <CreditCard size={16} /> Спосіб оплати
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {(["MONEY", "POINTS", "MIXED"] as const).map((m) => (
                      <button key={m} className={`time-btn ${paymentMethod === m ? "active" : ""}`}
                              onClick={() => setPaymentMethod(m)} style={{ padding: "10px 8px", fontSize: "13px" }}>
                        {m === "MONEY" ? "Грошима" : m === "POINTS" ? "Балами" : "Мікс"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="confirm-booking-btn"
                style={{ marginTop: "24px" }}
                disabled={!selectedTime || isBooking || (selectedTime !== null && !consultationPrice)}
                onClick={handleBooking}
              >
                {isBooking ? <span>Записуємось <Loader className="inline-loader" /></span>
                  : !selectedTime ? "Оберіть час візиту"
                    : !consultationPrice ? "Неможливо записатися (немає ціни)"
                      : "Оплатити та Записатися"}
              </button>
            </>
          )}
        </div>
      </div>

      <TopUpModal isOpen={showTopUpModal} onClose={() => setShowTopUpModal(false)} />
    </div>
  );
}
