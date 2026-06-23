import { useParams, useNavigate } from "react-router-dom";
import { Mail, CalendarDays, ArrowLeft, CreditCard, FileText, Info } from "lucide-react";
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
import type { PaymentFailureState } from "../PaymentFailurePage/PaymentFailurePage.tsx";

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
  } catch (e) { console.error(e); }
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

  const [mixedMoney, setMixedMoney] = useState<number | "">("");
  const [mixedPoints, setMixedPoints] = useState<number | "">("");

  const [note, setNote] = useState("");

  const { data: rawDoctor, isLoading: isDocLoading } = useDoctor(id || "");
  const { data: patientResponse } = usePatient(userId || "");
  const { mutate: bookAppointment, isPending: isBooking } = useCreateAppointment();

  const availablePoints = useMemo(() => {
    const pData = (patientResponse as any)?.data || patientResponse;
    if (!pData) return 0;

    if (typeof pData.points === 'number') return pData.points;

    if (Array.isArray(pData.rewards)) {
      return pData.rewards.reduce((sum: number, reward: any) => {
        return sum + (Number(reward.points) || 0);
      }, 0);
    }

    return 0;
  }, [patientResponse]);

  const doctor = useMemo(() => (rawDoctor as any)?.data || rawDoctor, [rawDoctor]);

  const profileIssues = useMemo(() => {
    const pData = (patientResponse as any)?.data || patientResponse;
    if (!pData) return [];
    const issues: string[] = [];
    const rawName = pData.fullName || "";
    const parts = rawName.trim().split(/\s+/);
    if (!parts[0]) issues.push("ім'я");
    if (!parts[1]) issues.push("прізвище");
    if (!pData.phone?.trim()) issues.push("номер телефону");
    return issues;
  }, [patientResponse]);

  const activeSchedule = useMemo(() => {
    const schedules = doctor?.schedule;
    if (!Array.isArray(schedules) || schedules.length === 0) return null;

    return [...schedules].reverse()[0];
  }, [doctor]);

  const rollingDays = useMemo(() => Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i)), []);

  const availableSlots = useMemo(() => {
    const sd = activeSchedule?.payload?.repeating || activeSchedule?.repeating;
    if (!sd) return [];
    if (!sd.daysOfWeek?.includes(getDay(selectedDate))) return [];

    const allGeneratedTimes = generateTimeSlots(sd.startTime || sd.start_time, sd.endTime || sd.end_time, sd.slotDuration || sd.slot_duration || 30);
    const now = new Date();
    const formattedDate = format(selectedDate, "yyyy-MM-dd");

    const allSlots = [
      ...(Array.isArray(doctor?.schedule) ? doctor.schedule : []),
      ...(Array.isArray(activeSchedule?.slots) ? activeSchedule.slots : []),
      ...(Array.isArray(activeSchedule?.payload?.slots) ? activeSchedule.payload.slots : []),
    ];

    return allGeneratedTimes.filter(time => {
      if (isSameDay(selectedDate, now)) {
        if (!isAfter(parse(time, "HH:mm", selectedDate), now)) {
          return false;
        }
      }

      const matchingSlot = allSlots.find((s: any) => {
        const t = String(s.from || "");
        return t.includes(formattedDate) && t.includes(time);
      });

      return matchingSlot && (matchingSlot.type === "AVAILABLE" || matchingSlot.status === "AVAILABLE");
    });
  }, [selectedDate, activeSchedule, doctor]);

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
      return t.includes(formattedDate) && t.includes(selectedTime) && (s.type === "AVAILABLE" || s.status === "AVAILABLE");
    });
  }, [selectedDate, selectedTime, activeSchedule, doctor]);

  const consultationPrice = useMemo(() => {
    if (!selectedTime) return null;
    let rawPrice = null;

    if (selectedSlotData?.pricePerSlot || selectedSlotData?.price) {
      rawPrice = selectedSlotData.pricePerSlot || selectedSlotData.price;
    } else {
      rawPrice = activeSchedule?.pricePerSlot || activeSchedule?.price
        || activeSchedule?.payload?.pricePerSlot || activeSchedule?.payload?.price
        || doctor?.pricePerSlot || doctor?.price || doctor?.consultationPrice || null;
    }

    return rawPrice ? rawPrice / 100 : null;
  }, [selectedSlotData, activeSchedule, selectedTime, doctor]);

  const COMMISSION_RATE = 0.025;

  const commissionData = useMemo(() => {
    if (!consultationPrice) return null;

    let baseMoneyToPay = 0;
    let pointsToPay = 0;

    if (paymentMethod === "MONEY") {
      baseMoneyToPay = consultationPrice;
    } else if (paymentMethod === "POINTS") {
      pointsToPay = consultationPrice;
    } else if (paymentMethod === "MIXED") {
      baseMoneyToPay = Number(mixedMoney) || 0;
      pointsToPay = Number(mixedPoints) || 0;
    }

    const commissionAmount = baseMoneyToPay * COMMISSION_RATE;
    const totalMoneyWithCommission = baseMoneyToPay + commissionAmount;

    return {
      baseMoneyToPay,
      pointsToPay,
      commissionAmount,
      totalMoneyWithCommission,
      isValidMix: paymentMethod === "MIXED" ? (baseMoneyToPay + pointsToPay) === consultationPrice : true
    };
  }, [consultationPrice, paymentMethod, mixedMoney, mixedPoints]);

  const handleBooking = () => {
    if (profileIssues.length > 0) {
      toast.error(`Для запису заповніть профіль: ${profileIssues.join(", ")}`);
      return;
    }

    if (!selectedSlotData) {
      toast.error("Цей час вже зайнятий або недоступний.");
      return;
    }

    if (paymentMethod === "MIXED" && !commissionData?.isValidMix) {
      toast.error("Сума грошей та балів має дорівнювати вартості прийому!");
      return;
    }

    const slotIdToBook = selectedSlotData.slotId || selectedSlotData.id || selectedSlotData._id;
    const doctorIdToBook = doctor?._id || doctor?.id || id;

    if (!slotIdToBook || !doctorIdToBook) {
      toast.error("Не знайдено ідентифікатор слота або лікаря.");
      return;
    }

    const payload: any = {
      slotId: slotIdToBook,
      doctorId: doctorIdToBook,
      pricePerSlot: consultationPrice ? consultationPrice * 100 : undefined,
      payment_method: paymentMethod,
      note: note.trim() ? note.trim() : undefined,
    };

    if (paymentMethod === "MIXED") {
      const mAmount = Number(mixedMoney) * 100;
      const pAmount = Number(mixedPoints);

      payload.money_amount = mAmount;
      payload.points_amount = pAmount;
      payload.moneyAmount = mAmount;
      payload.pointsAmount = pAmount;
    }

    bookAppointment(
      payload,
      {
        onSuccess: (response: any) => {
          const data = response?.data || response;
          const appointmentId = data?._id || data?.id || data?.appointmentId;
          toast.success("Ви успішно записані! 🎉", { duration: 3000 });
          if (appointmentId) {
            setTimeout(() => navigate(`/appointments/${appointmentId}`), 800);
          } else {
            setSelectedTime(null);
            setNote("");
            setMixedMoney("");
            setMixedPoints("");
          }
        },
        onError: (err: any) => {
          const errData = err?.response?.data || {};
          const msg    = errData?.message || err?.message || "";
          const status = err?.response?.status;

          const reason: PaymentFailureState["reason"] =
            msg.includes("INSUFFICIENT_FUNDS") || status === 402
              ? "INSUFFICIENT_FUNDS"
              : msg.includes("declined") || msg.includes("DECLINED")
                ? "CARD_DECLINED"
                : msg.includes("timeout") || msg.includes("TIMEOUT")
                  ? "TIMEOUT"
                  : "UNKNOWN";

          const failureState: PaymentFailureState = {
            doctorId:   doctorIdToBook,
            doctorName: doctor?.fullName || doctor?.full_name || "Лікар",
            date: selectedDate && selectedTime
              ? `${format(selectedDate, "d MMMM yyyy", { locale: uk })}, ${selectedTime}`
              : undefined,
            amount:  consultationPrice ?? undefined,
            reason,
            slotId:  slotIdToBook,
          };

          navigate("/payment-failure", { state: failureState });
        },
      }
    );
  };

  if (isDocLoading) return <div className="loading-screen"><Loader /></div>;

  const safePrice = consultationPrice || 0;

  return (
    <div className="booking-page aero-viewport light-theme">
      <div className="bright-gradient-bg">
        <div className="light-blob blob-1" /><div className="light-blob blob-2" />
      </div>

      <div className="booking-wrapper">
        <button className="nav-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Назад
        </button>

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
              <button className="confirm-booking-btn find-other-doctors-btn"
                      onClick={() => navigate(`/?spec=${encodeURIComponent(doctor?.specializationName || "Усі")}`)}>
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
                    const sd = activeSchedule?.payload?.repeating || activeSchedule?.repeating;
                    const isWorkDay = sd?.daysOfWeek?.includes(getDay(day));
                    return (
                      <button key={day.toString()}
                              className={`date-box ${isSelected ? "active" : ""} ${!isWorkDay ? "disabled" : ""}`}
                              onClick={() => { setSelectedDate(day); setSelectedTime(null); setNote(""); }}
                              disabled={!isWorkDay}>
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
                      <button key={time} className={`time-btn ${selectedTime === time ? "active" : ""}`}
                              onClick={() => setSelectedTime(time)}>
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
                  {consultationPrice
                    ? `Вартість прийому: ${consultationPrice} ₴`
                    : <span className="price-error-text">Ціна не вказана для цього часу</span>}
                </div>
              )}

              {selectedTime && consultationPrice && (
                <div className="appointment-note-section" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", color: "#64748b" }}>
                    <FileText size={16} /> Коментар для лікаря (необов'язково)
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Напишіть ваші симптоми або питання..."
                    style={{
                      width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #e2e8f0",
                      background: "rgba(255, 255, 255, 0.5)", minHeight: "60px", resize: "vertical", fontSize: "14px", outline: "none", fontFamily: "inherit"
                    }}
                  />
                </div>
              )}

              {selectedTime && consultationPrice && (
                <div className="payment-method-section" style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", color: "#64748b" }}>
                    <CreditCard size={16} /> Спосіб оплати
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    {(["MONEY", "POINTS", "MIXED"] as const).map((m) => (
                      <button key={m} className={`time-btn ${paymentMethod === m ? "active" : ""}`}
                              onClick={() => {
                                setPaymentMethod(m);
                                if (m !== "MIXED") { setMixedMoney(""); setMixedPoints(""); }
                              }}
                              style={{ padding: "10px 8px", fontSize: "13px" }}>
                        {m === "MONEY" ? "Грошима" : m === "POINTS" ? "Бонусами" : "Мікс"}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "MIXED" && (
                    <div style={{ display: "flex", gap: "10px", marginTop: "8px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>Списати грошей (₴)</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max={safePrice}
                            value={mixedMoney}
                            onChange={(e) => {
                              const rawValue = e.target.value;
                              if (rawValue === "") {
                                setMixedMoney("");
                                setMixedPoints("");
                              } else {
                                let numVal = Number(rawValue);
                                if (numVal > safePrice) numVal = safePrice;
                                setMixedMoney(numVal);
                                setMixedPoints(safePrice - numVal);
                              }
                            }}
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                          />
                          <button onClick={() => { setMixedMoney(safePrice); setMixedPoints(0); }} style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', fontSize: '11px', padding: '0 8px', cursor: 'pointer', fontWeight: '600' }}>Всі</button>
                        </div>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>
                          Списати балів <span style={{ color: "#10b981" }}>(Доступно: {availablePoints})</span>
                        </label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="number"
                            min="0"
                            max={Math.min(safePrice, availablePoints)}
                            value={mixedPoints}
                            onChange={(e) => {
                              const rawValue = e.target.value;
                              if (rawValue === "") {
                                setMixedPoints("");
                                setMixedMoney("");
                              } else {
                                let numVal = Number(rawValue);
                                if (numVal > availablePoints) {
                                  numVal = availablePoints;
                                  toast.error(`У вас лише ${availablePoints} балів!`, { id: "p-err" });
                                }
                                if (numVal > safePrice) numVal = safePrice;
                                setMixedPoints(numVal);
                                setMixedMoney(safePrice - numVal);
                              }
                            }}
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0" }}
                          />
                          <button onClick={() => {
                            const pointsToSpend = Math.min(safePrice, availablePoints);
                            setMixedPoints(pointsToSpend);
                            setMixedMoney(safePrice - pointsToSpend);
                          }} style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', fontSize: '11px', padding: '0 8px', cursor: 'pointer', fontWeight: '600' }}>Всі</button>
                        </div>
                      </div>

                    </div>
                  )}

                  {commissionData && commissionData.commissionAmount > 0 && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", background: "#fef2f2", padding: "12px", borderRadius: "8px", border: "1px solid #fecdd3" }}>
                      <Info size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div style={{ fontSize: "13px", color: "#be123c" }}>
                        Комісія платіжної системи: <strong>2.5%</strong>.
                        <br />
                        З вашого грошового балансу буде списано додатково <strong>{commissionData.commissionAmount.toFixed(2)} ₴</strong>.
                        <br />
                        Разом до списання грошима: <strong>{commissionData.totalMoneyWithCommission.toFixed(2)} ₴</strong>.
                      </div>
                    </div>
                  )}
                  {paymentMethod === "POINTS" && (
                    <div style={{ fontSize: "13px", color: "#10b981", background: "#ecfdf5", padding: "10px", borderRadius: "8px", border: "1px solid #a7f3d0", textAlign: "center" }}>
                      При оплаті бонусами комісія <strong>не стягується!</strong> 🎉
                    </div>
                  )}
                </div>
              )}

              <button
                className="confirm-booking-btn"
                style={{ marginTop: "24px" }}
                disabled={!selectedTime || isBooking || (selectedTime !== null && !consultationPrice) || (paymentMethod === "MIXED" && !commissionData?.isValidMix)}
                onClick={handleBooking}
              >
                {isBooking
                  ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}><Loader className="inline-loader" /></span>
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
