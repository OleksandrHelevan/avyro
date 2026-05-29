import { useParams, useNavigate } from "react-router-dom";
import { Mail, CalendarDays, ArrowLeft } from "lucide-react";
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
import Loader from "../../components/Loader/Loader.tsx";
import TopUpModal from "../../components/WalletModal/TopUpModal.tsx";

const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Doctor&background=E0E7FF&color=4F46E5&size=128";

const generateTimeSlots = (startTime: string, endTime: string, slotDuration: number) => {
  const slots = [];
  try {
    let current = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());

    if (isNaN(current.getTime()) || isNaN(end.getTime())) return [];

    while (isBefore(current, end)) {
      slots.push(format(current, 'HH:mm'));
      current = new Date(current.getTime() + slotDuration * 60000);
    }
  } catch (e) {
    console.error("Помилка генерації слотів:", e);
  }
  return slots;
};

export default function DoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  const { data: rawDoctor, isLoading: isDocLoading } = useDoctor(id || "");
  const { mutate: bookAppointment, isPending: isBooking } = useCreateAppointment();
  const doctor = useMemo(() => (rawDoctor as any)?.data || rawDoctor, [rawDoctor]);

  const activeSchedule = useMemo(() => {
    const schedules = doctor?.schedule;
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) return null;

    const reversedSchedules = [...schedules].reverse();

    return reversedSchedules.find((s: any) => s.status === "APPROVED") || reversedSchedules[0];
  }, [doctor]);

  const rollingDays = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
  }, []);

  const availableSlots = useMemo(() => {
    const scheduleData = activeSchedule?.payload?.repeating || activeSchedule?.repeating;
    if (!scheduleData) return [];

    const currentDayIdx = getDay(selectedDate);
    const isWorkDay = scheduleData.daysOfWeek?.includes(currentDayIdx);
    if (!isWorkDay) return [];

    const allSlots = generateTimeSlots(
      scheduleData.startTime || scheduleData.start_time,
      scheduleData.endTime || scheduleData.end_time,
      scheduleData.slotDuration || scheduleData.slot_duration || 30
    );

    const now = new Date();
    return allSlots.filter(t => {
      if (!isSameDay(selectedDate, now)) return true;
      const slotTime = parse(t, 'HH:mm', selectedDate);
      return isAfter(slotTime, now);
    });
  }, [selectedDate, activeSchedule]);

  const selectedSlotData = useMemo(() => {
    if (!selectedTime || !activeSchedule) return null;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    const allPossibleSlots = [
      ...(Array.isArray(doctor?.schedule) ? doctor.schedule : []),
      ...(Array.isArray(activeSchedule?.slots) ? activeSchedule.slots : []),
      ...(Array.isArray(activeSchedule?.payload?.slots) ? activeSchedule.payload.slots : [])
    ];

    return allPossibleSlots.find((s: any) => {
      const timeStr = String(s.from || "");
      return timeStr.includes(formattedDate) &&
        timeStr.includes(selectedTime) &&
        s.type === "AVAILABLE";
    });
  }, [selectedDate, selectedTime, activeSchedule, doctor]);

  const consultationPrice = useMemo(() => {
    if (!selectedTime) return null;

    if (selectedSlotData && (selectedSlotData.pricePerSlot || selectedSlotData.price)) {
      return selectedSlotData.pricePerSlot || selectedSlotData.price;
    }

    const schedulePrice = activeSchedule?.pricePerSlot
      || activeSchedule?.price
      || activeSchedule?.payload?.pricePerSlot
      || activeSchedule?.payload?.price;

    const finalPrice = schedulePrice || doctor?.pricePerSlot || doctor?.price || doctor?.consultationPrice;

    return finalPrice || null;
  }, [selectedSlotData, activeSchedule, selectedTime, doctor]);

  const handleBooking = () => {
    if (!selectedSlotData) {
      toast.error(`Помилка: Цей час вже зайнятий або недоступний.`);
      return;
    }

    const slotIdToBook = selectedSlotData.slotId || selectedSlotData.id || selectedSlotData._id;

    if (!slotIdToBook) {
      toast.error(`Помилка: Не знайдено ідентифікатор слота.`);
      return;
    }

    bookAppointment(
      {
        slotId: slotIdToBook,
        pricePerSlot: consultationPrice
      } as any,
      {
        onSuccess: () => {
          setSelectedTime(null);
          toast.success("Ви успішно записані!");
        },
        onError: (err: any) => {
          const errorMessage = err?.response?.data?.message || err?.message || "";
          if (errorMessage.includes("INSUFFICIENT_FUNDS") || err?.response?.status === 402) {
            toast.error("Недостатньо коштів на балансі. Будь ласка, поповніть гаманець.");
            setShowTopUpModal(true);
          } else {
            toast.error(errorMessage || "Сталася помилка при записі.");
          }
        }
      }
    );
  };

  if (isDocLoading) return <div className="loading-screen"><Loader/></div>;

  return (
    <div className="booking-page aero-viewport light-theme">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
        <div className="light-blob blob-2"></div>
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
              <p className="no-schedule-title">
                У цього спеціаліста наразі немає доступних годин для запису.
              </p>
              <p className="no-schedule-desc">
                Не хвилюйтеся! У нас є інші чудові фахівці цього профілю.
              </p>
              <button
                className="confirm-booking-btn find-other-doctors-btn"
                onClick={() => {
                  const spec = doctor?.specializationName || "Усі";
                  navigate(`/?spec=${encodeURIComponent(spec)}`);
                }}
              >
                Знайти схожих лікарів
              </button>
            </div>
          ) : (
            <>
              <div className="date-selector-section">
                <label>Оберіть дату</label>
                <div className="date-scroll-container">
                  {rollingDays.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const scheduleData = activeSchedule?.payload?.repeating || activeSchedule?.repeating;
                    const isWorkDay = scheduleData?.daysOfWeek?.includes(getDay(day));

                    return (
                      <button
                        key={day.toString()}
                        className={`date-box ${isSelected ? "active" : ""} ${!isWorkDay ? "disabled" : ""}`}
                        onClick={() => {
                          setSelectedDate(day);
                          setSelectedTime(null);
                        }}
                        disabled={!isWorkDay}
                      >
                        <span className="day-name">{format(day, "EE", {locale: uk})}</span>
                        <span className="day-number">{format(day, "d")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="time-selector-section">
                <label>Вільні години</label>
                <div className="time-grid">
                  {availableSlots.length > 0 ? (
                    availableSlots.map(time => (
                      <button
                        key={time}
                        className={`time-btn ${selectedTime === time ? "active" : ""}`}
                        onClick={() => setSelectedTime(time)}
                      >
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
                  {consultationPrice ? (
                    `Вартість прийому: ${consultationPrice} ₴`
                  ) : (
                    <span className="price-error-text">Ціна не вказана для цього часу</span>
                  )}
                </div>
              )}

              <button
                className="confirm-booking-btn"
                disabled={!selectedTime || isBooking || (selectedTime !== null && !consultationPrice)}
                onClick={handleBooking}
              >
                {isBooking ? (
                  <span> Записуємось <Loader className={"inline-loader"}/></span>
                ) : !selectedTime ? (
                  "Оберіть час візиту"
                ) : !consultationPrice ? (
                  "Неможливо записатися (немає ціни)"
                ) : (
                  "Оплатити та Записатися"
                )}
              </button>

              {selectedTime && consultationPrice && (
                <p className="payment-info">Кошти будуть списані з вашого внутрішнього гаманця</p>
              )}
            </>
          )}
        </div>
      </div>

      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
      />
    </div>
  );
}
