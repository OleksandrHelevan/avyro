import { useParams, useNavigate } from "react-router-dom";
import { Mail, CalendarDays, ArrowLeft } from "lucide-react";
import {
  format, isSameDay, isBefore, startOfToday,
  parse, isAfter, getDay, addDays
} from "date-fns";
import { uk } from "date-fns/locale";

import "./DoctorProfilePage.css";
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import {useMemo, useState} from "react";

// Допоміжна функція для генерації годин
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

  // 1. Отримуємо дані доктора
  const { data: rawDoctor, isLoading: isDocLoading } = useDoctor(id || "");

  // Розпаковка профілю
  const doctor = useMemo(() => (rawDoctor as any)?.data || rawDoctor, [rawDoctor]);

  // 2. ДІАГНОСТИКА ТА ПОШУК РОЗКЛАДУ
  const activeSchedule = useMemo(() => {
    const schedules = doctor?.schedule;

    console.log("🔍 [DIAGNOSTIC] Raw Doctor:", doctor);
    console.log("🔍 [DIAGNOSTIC] Schedules Array:", schedules);

    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      console.warn("⚠️ Розклад у об'єкті доктора порожній!");
      return null;
    }

    // Шукаємо APPROVED або беремо перший
    const found = schedules.find((s: any) => s.status === "APPROVED") || schedules[0];
    console.log("✅ [DIAGNOSTIC] Selected active schedule:", found);
    return found;
  }, [doctor]);

  // Список дат для верхнього ряду
  const rollingDays = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));
  }, []);

  // 3. ДІАГНОСТИКА ТА ГЕНЕРАЦІЯ ГОДИН
  const availableSlots = useMemo(() => {
    // Враховуємо різну вкладеність (payload чи корінь)
    const scheduleData = activeSchedule?.payload?.repeating || activeSchedule?.repeating;

    console.log("⚙️ [DIAGNOSTIC] Config for slots:", scheduleData);

    if (!scheduleData) return [];

    const currentDayIdx = getDay(selectedDate); // 0 - Sun, 1 - Mon...
    const isWorkDay = scheduleData.daysOfWeek.includes(currentDayIdx);

    console.log(`📅 [DIAGNOSTIC] Date: ${format(selectedDate, "dd.MM")}, Day Index: ${currentDayIdx}, WorkDay: ${isWorkDay}`);

    if (!isWorkDay) return [];

    const allSlots = generateTimeSlots(
      scheduleData.startTime || scheduleData.start_time,
      scheduleData.endTime || scheduleData.end_time,
      scheduleData.slotDuration || scheduleData.slot_duration || 30
    );

    const now = new Date();
    const finalSlots = allSlots.filter(t => {
      if (!isSameDay(selectedDate, now)) return true;
      const slotTime = parse(t, 'HH:mm', selectedDate);
      return isAfter(slotTime, now);
    });

    console.log("🕒 [DIAGNOSTIC] Final slots generated:", finalSlots);
    return finalSlots;
  }, [selectedDate, activeSchedule]);

  if (isDocLoading) return <div className="loading">Завантаження...</div>;

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
            {doctor?.avatarUrl && <img src={doctor.avatarUrl} alt="doc" />}
          </div>
          <div className="doctor-details">
            <h2>{doctor?.fullName || "Спеціаліст"}</h2>
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
                const isWorkDay = scheduleData?.daysOfWeek.includes(getDay(day));

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

          <button className="confirm-booking-btn" disabled={!selectedTime}>
            {selectedTime ? `Записатися на ${selectedTime}` : "Оберіть час"}
          </button>
          <p className="payment-info">Оплата після підтвердження візиту</p>
        </div>
      </div>
    </div>
  );
}
