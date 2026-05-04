import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, Clock, ChevronLeft, Save } from "lucide-react";
import { useRequestSchedule } from "../../domains/users/useRequestSchedule/useRequestSchedule";
import './ScheduleEditor.css';

const CURRENT_USER_ID = (localStorage.getItem("userId") || "").replace(/"/g, '');

const DAYS_OF_WEEK = [
  { id: 1, label: "Пн" }, { id: 2, label: "Вт" }, { id: 3, label: "Ср" },
  { id: 4, label: "Чт" }, { id: 5, label: "Пт" }, { id: 6, label: "Сб" }, { id: 0, label: "Нд" }
];

export default function ScheduleEditor() {
  const navigate = useNavigate();
  const { mutate: requestSchedule, isPending } = useRequestSchedule();

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [params, setParams] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    startTime: "09:00",
    endTime: "18:00",
    slotDuration: 30
  });

  const toggleDay = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDays.length === 0) return toast.error("Оберіть робочі дні");

    requestSchedule({
      doctorId: CURRENT_USER_ID,
      month: params.month,
      year: params.year,
      title: `Графік: ${params.month}/${params.year}`,
      isRepeated: true,
      repeating: {
        type: "WEEKLY",
        daysOfWeek: selectedDays,
        startTime: params.startTime,
        endTime: params.endTime,
        slotDuration: params.slotDuration,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }, {
      onSuccess: () => {
        toast.success("Графік успішно відправлено!");
        navigate("/profile");
      }
    });
  };

  return (
    <div className="aero-viewport light-theme profile-page doctor-theme">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1"></div>
      </div>

      <div className="main-content schedule-editor-container">
        <header className="page-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ChevronLeft size={20} /> Назад до профілю
          </button>
          <h1 className="editor-title">Налаштування робочого графіка</h1>
        </header>

        <div className="profile-card glass-light editor-card">
          <form onSubmit={handleSubmit}>
            {/* СЕКЦІЯ ДНІВ */}
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

            {/* СЕКЦІЯ ЧАСУ */}
            <section className="schedule-section-block">
              <h3 className="schedule-section-title">
                <Clock size={20} className="icon-accent" /> Параметри часу
              </h3>
              <div className="schedule-params-grid">
                <div className="form-group">
                  <label>Початок роботи</label>
                  <input
                    type="time"
                    value={params.startTime}
                    onChange={e => setParams({...params, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Кінець роботи</label>
                  <input
                    type="time"
                    value={params.endTime}
                    onChange={e => setParams({...params, endTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Тривалість прийому</label>
                  <select
                    value={params.slotDuration}
                    onChange={e => setParams({...params, slotDuration: Number(e.target.value)})}
                  >
                    <option value={20}>20 хв</option>
                    <option value={30}>30 хв</option>
                    <option value={45}>45 хв</option>
                    <option value={60}>60 хв</option>
                  </select>
                </div>
              </div>
            </section>

            {/* КНОПКА ЗБЕРЕЖЕННЯ */}
            <button
              type="submit"
              disabled={isPending}
              className="save-schedule-btn glow-effect"
            >
              {isPending ? (
                <span className="spinner">⏳</span>
              ) : (
                <>
                  <Save size={20} />
                  <span>Відправити графік на підтвердження</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
