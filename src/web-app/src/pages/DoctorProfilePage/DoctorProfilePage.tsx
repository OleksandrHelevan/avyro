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
import { useCreateAppointment } from "../../domains/users/useCreateAppointment/useCreateAppointment";

// Константа для аватарки за замовчуванням
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Doctor&background=E0E7FF&color=4F46E5&size=128";

// Допоміжна функція для генерації часових слотів
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
  const { id } = useParams(); // Отримуємо ID лікаря з URL
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // 1. Отримуємо дані доктора
  const { data: rawDoctor, isLoading: isDocLoading } = useDoctor(id || "");

  // 2. Підключаємо хук для створення запису
  const { mutate: bookAppointment, isPending: isBooking } = useCreateAppointment();

  // Розпаковка профілю
  const doctor = useMemo(() => (rawDoctor as any)?.data || rawDoctor, [rawDoctor]);

  // 3. Пошук активного розкладу
  const activeSchedule = useMemo(() => {
    const schedules = doctor?.schedule;
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) return null;
    return schedules.find((s: any) => s.status === "APPROVED") || schedules[0];
  }, [doctor]);

  // Список дат на 14 днів вперед
  const rollingDays = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
  }, []);

  // 4. Генерація доступних годин для обраної дати
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

  // 5. ЛОГІКА ВІДПРАВКИ ЗАПИТУ
  const handleBooking = () => {
    if (!selectedTime) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    // Збираємо всі слоти
    const allPossibleSlots = [
      ...(Array.isArray(doctor?.schedule) ? doctor.schedule : []),
      ...(Array.isArray(activeSchedule?.slots) ? activeSchedule.slots : []),
      ...(Array.isArray(activeSchedule?.payload?.slots) ? activeSchedule.payload.slots : [])
    ];

    // Шукаємо слот
    const exactSlot = allPossibleSlots.find((s: any) => {
      const timeStr = String(s.from || "");
      return timeStr.includes(formattedDate) &&
        timeStr.includes(selectedTime) &&
        s.type === "AVAILABLE";
    });

    const slotIdToBook = exactSlot?.slotId;

    if (!slotIdToBook) {
      toast.error(`Помилка: Цей час вже зайнятий або недоступний.`);
      return;
    }

// ✅ ПРАВИЛЬНИЙ ВИКЛИК
    bookAppointment(
      {
        slotId: slotIdToBook,
        doctorId: (doctor?.id || doctor?._id || id || "").toString()
      },
      {
        onSuccess: () => {
          setSelectedTime(null);
        }
      }
    );
  };

  if (isDocLoading) return <div className="loading">Завантаження профілю...</div>;

  return (
    <div className="booking-page">
      <div className="decor-elements">
        <div className="decor-item heart">❤</div>
        <div className="decor-item plus p1">+</div>
        <div className="decor-item plus p2">+</div>
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
                    <span className="day-name">{format(day, "EE", { locale: uk })}</span>
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

          <button
            className="confirm-booking-btn"
            disabled={!selectedTime || isBooking}
            onClick={handleBooking}
          >
            {isBooking ? (
              <span className="spinner">⏳ Записуємо...</span>
            ) : selectedTime ? (
              `Записатися на ${selectedTime}`
            ) : (
              "Оберіть час візиту"
            )}
          </button>
          <p className="payment-info">Оплата після підтвердження візиту</p>
        </div>
      </div>
    </div>
  );
}
