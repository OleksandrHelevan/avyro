import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Clock, ChevronLeft, Save, CalendarCheck, Edit3 } from "lucide-react";

import { useRequestSchedule } from "../../domains/users/useRequestSchedule/useRequestSchedule";
import { useDoctor } from "../../domains/users/useDoctor/useDoctor";
import './ScheduleEditor.css';
import Loader from "../../components/Loader/Loader.tsx";

const CURRENT_USER_ID = (localStorage.getItem("userId") || "").replace(/"/g, '');

const DAYS_OF_WEEK = [
  { id: 1, label: "Пн" }, { id: 2, label: "Вт" }, { id: 3, label: "Ср" },
  { id: 4, label: "Чт" }, { id: 5, label: "Пт" }, { id: 6, label: "Сб" }, { id: 0, label: "Нд" }
];

const getDaysNames = (daysArray: number[]) => {
  const map: Record<number, string> = { 1: "Пн", 2: "Вт", 3: "Ср", 4: "Чт", 5: "Пт", 6: "Сб", 0: "Нд" };
  return daysArray
    .map(d => map[d])
    .filter(Boolean)
    .join(", ");
};

export default function ScheduleEditor() {
  const navigate = useNavigate();

  const { data: rawDoctor, isLoading: isDoctorLoading } = useDoctor(CURRENT_USER_ID);
  const { mutate: requestSchedule, isPending } = useRequestSchedule();

  const [isEditing, setIsEditing] = useState(false);

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [params, setParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startTime: "09:00",
    endTime: "18:00",
    slotDuration: 30,
    price: 500 // Стейт форми
  });

  const doctor = useMemo(() => (rawDoctor as any)?.data || rawDoctor, [rawDoctor]);

  // 🚀 ОНОВЛЕНО: Тепер ми беремо найсвіжіший графік з кінця масиву
  const activeSchedule = useMemo(() => {
    const schedules = doctor?.schedule;
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) return null;

    // Робимо копію і перевертаємо, щоб найновіші були першими
    const reversedSchedules = [...schedules].reverse();

    return reversedSchedules.find((s: any) => s.status === "APPROVED") || reversedSchedules[0];
  }, [doctor]);

  const repeatingParams = useMemo(() => {
    return activeSchedule?.payload?.repeating || activeSchedule?.repeating;
  }, [activeSchedule]);

  const hasConfirmedSchedule = !!repeatingParams;
  const showForm = !hasConfirmedSchedule || isEditing;

  // Глибокий пошук ціни для автозаповнення форми
  useEffect(() => {
    if (repeatingParams && isEditing) {
      setSelectedDays(repeatingParams.daysOfWeek || []);

      const savedPrice = activeSchedule?.pricePerSlot
        || activeSchedule?.price
        || activeSchedule?.payload?.pricePerSlot
        || activeSchedule?.payload?.price
        || repeatingParams?.pricePerSlot
        || repeatingParams?.price
        || 500;

      setParams(prev => ({
        ...prev,
        startTime: repeatingParams.startTime || repeatingParams.start_time || "09:00",
        endTime: repeatingParams.endTime || repeatingParams.end_time || "18:00",
        slotDuration: repeatingParams.slotDuration || repeatingParams.slot_duration || 30,
        price: savedPrice
      }));
    }
  }, [repeatingParams, isEditing, activeSchedule]);

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) return toast.error("Оберіть робочі дні");

    // Формуємо ідеальний запит за Swagger'ом
    const payload = {
      doctorId: CURRENT_USER_ID,
      month: params.month,
      year: params.year,
      title: `Графік: ${params.month}/${params.year}`,
      isRepeated: true,
      pricePerSlot: params.price, // Тільки на верхньому рівні!
      repeating: {
        type: "WEEKLY",
        daysOfWeek: selectedDays,
        startTime: params.startTime,
        endTime: params.endTime,
        slotDuration: params.slotDuration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    requestSchedule(payload as any, {
      onSuccess: () => {
        toast.success("Графік успішно відправлено на перевірку!");
        setIsEditing(false); // Закриваємо форму після успіху
      },
      onError: (err: any) => {
        toast.error("Помилка збереження графіка: " + (err.message || "400 Bad Request"));
      }
    });
  };

  // Глибокий пошук ціни для відображення в "картці"
  const displayPrice = useMemo(() => {
    return activeSchedule?.pricePerSlot
      || activeSchedule?.price
      || activeSchedule?.payload?.pricePerSlot
      || activeSchedule?.payload?.price
      || repeatingParams?.pricePerSlot
      || repeatingParams?.price;
  }, [activeSchedule, repeatingParams]);

  if (isDoctorLoading) return <div className="loading-screen"><Loader/></div>;

  return (
    <div className="aero-viewport light-theme profile-page doctor-theme">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
      </div>

      <div className="main-content schedule-editor-container">
        <header className="page-header">
          <button onClick={() => navigate("/profile")} className="back-btn">
            <ChevronLeft size={20} /> Назад до профілю
          </button>
          <h1 className="editor-title">Налаштування робочого графіка</h1>
        </header>

        {!showForm ? (
          <div className="profile-card glass-light editor-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ color: "#1f2937", margin: "0 0 5px", fontSize: "1.5rem", fontWeight: "800", display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CalendarCheck size={28} color="#10b981" />
                  Ваш активний графік
                </h2>
                <p style={{ color: "#6b7280", margin: 0, fontSize: "0.95rem" }}>
                  Пацієнти бачать ці налаштування при записі
                </p>
              </div>

              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "10px 20px", fontSize: "0.95rem", borderRadius: "12px",
                  border: "none", cursor: "pointer", background: "#f3f4f6", color: "#374151", fontWeight: "600",
                }}
              >
                <Edit3 size={18} />
                Змінити
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", color: "var(--med-purple)" }}>
                  <Calendar size={24} />
                  <h3 style={{ margin: 0, color: "#1e293b" }}>Робочі дні</h3>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {repeatingParams?.daysOfWeek?.map((d: number) => (
                    <span key={d} style={{ background: "var(--med-purple)", color: "white", padding: "6px 14px", borderRadius: "20px", fontWeight: "600", fontSize: "0.95rem" }}>
                      {getDaysNames([d])}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px", color: "#0284c7" }}>
                  <Clock size={24} />
                  <h3 style={{ margin: 0, color: "#1e293b" }}>Години та вартість</h3>
                </div>
                <p style={{ margin: "0 0 10px", fontSize: "1.1rem", fontWeight: "600", color: "#334155" }}>
                  {repeatingParams?.startTime || repeatingParams?.start_time} — {repeatingParams?.endTime || repeatingParams?.end_time}
                </p>
                <p style={{ margin: "0 0 8px 0", fontSize: "0.95rem", color: "#64748b" }}>
                  Тривалість слота: <strong>{repeatingParams?.slotDuration || repeatingParams?.slot_duration} хв</strong>
                </p>
                <p style={{ margin: 0, fontSize: "1.05rem", color: "#10b981", fontWeight: "700" }}>
                  Вартість прийому: {displayPrice ? `${displayPrice} ₴` : "Не вказана"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="profile-card glass-light editor-card">
            {hasConfirmedSchedule && isEditing && (
              <div style={{ marginBottom: "20px", textAlign: "right" }}>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", fontWeight: "600", textDecoration: "underline" }}
                >
                  Скасувати редагування
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <section className="schedule-section-block">
                <h3 className="schedule-section-title">
                  <Calendar size={20} className="icon-accent" /> Оберіть робочі дні
                </h3>
                <div className="days-flex-container">
                  {DAYS_OF_WEEK.map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDay(day.id)}
                      className={`day-toggle-btn ${selectedDays.includes(day.id) ? 'active' : ''}`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="schedule-section-block">
                <h3 className="schedule-section-title">
                  <Clock size={20} className="icon-accent" /> Параметри часу та ціни
                </h3>
                <div className="schedule-params-grid">
                  <div className="form-group">
                    <label>Початок роботи</label>
                    <input type="time" value={params.startTime} onChange={e => setParams({...params, startTime: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Кінець роботи</label>
                    <input type="time" value={params.endTime} onChange={e => setParams({...params, endTime: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Тривалість прийому</label>
                    <select value={params.slotDuration} onChange={e => setParams({...params, slotDuration: Number(e.target.value)})}>
                      <option value={20}>20 хв</option>
                      <option value={30}>30 хв</option>
                      <option value={45}>45 хв</option>
                      <option value={60}>60 хв</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Вартість слота (₴)</label>
                    <input
                      type="number"
                      min="1"
                      value={params.price}
                      onChange={e => setParams({...params, price: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>
              </section>

              <button type="submit" disabled={isPending} className="save-schedule-btn glow-effect">
                {isPending ? <span className="spinner">⏳</span> : <><Save size={20} /><span>{hasConfirmedSchedule ? "Оновити графік" : "Відправити графік на підтвердження"}</span></>}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
