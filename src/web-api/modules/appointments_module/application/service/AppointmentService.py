from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from datetime import datetime, timezone

from modules.appointments_module.domains.appointment.Appointment import Appointment
from modules.appointments_module.domains.slot.Slot import SlotType
from modules.appointments_module.infrastructure.persistence import SlotRepository
from modules.appointments_module.infrastructure.persistence.AppointmentRepository import AppointmentRepository
from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository
from modules.users_module.domains.reward.Reward import Reward, RewardType, RewardSource
from modules.users_module.infrastructure.persistence.RewardRepository import RewardRepository


class AppointmentService:
    def __init__(
        self,
        appointment_repository: AppointmentRepository,
        schedule_repository: ScheduleRepository,
        slot_repository: SlotRepository,
        account_service=None,
        reward_repository: RewardRepository = None,
        notification_service=None,
        user_repository=None,
    ):
        self.appointment_repository = appointment_repository
        self.schedule_repository = schedule_repository
        self.account_service = account_service
        self.reward_repository = reward_repository
        self.slot_repository = slot_repository
        self.notification_service = notification_service
        self.user_repository = user_repository

    async def book_appointment(self, doctor_id: str, slot_id: str, patient_id: str, dto) -> dict:
        try:
            doctor_oid = ObjectId(doctor_id)
            slot_oid = ObjectId(slot_id)
            patient_oid = ObjectId(patient_id)
        except (InvalidId, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID"
            )

        schedules = self.schedule_repository.get_by_doctor_id(doctor_oid)
        if not schedules:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Розклад для цього лікаря не знайдено"
            )

        target_schedule = None
        target_slot = None

        for schedule in schedules:
            for slot in schedule.slots:
                if str(slot.id) == str(slot_oid):
                    target_schedule = schedule
                    target_slot = slot
                    break
            if target_slot:
                break

        if not target_slot or not target_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Слот не знайдено в розкладах лікаря"
            )

        if target_slot.slot_type != SlotType.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Цей слот вже зайнятий або недоступний"
            )

        price = target_schedule.price_per_slot
        final_price = price
        if dto.is_discount_used and dto.discount > 0:
            final_price = price * (1 - dto.discount / 100)

        # Створення об'єкта Appointment
        appointment = Appointment(
            patient_id=patient_oid,
            slot_id=slot_oid,
            doctor_id=doctor_oid,
            from_time=target_slot.from_time,
            to_time=target_slot.to_time,
            base_price=price,
            discount=dto.discount,
            is_discount_used=dto.is_discount_used,
            final_price=round(final_price, 2),
            notes=[]
        )
        created = self.appointment_repository.create(appointment)

        self.schedule_repository.book_slot(
            schedule_id=target_schedule.id,
            slot_id=slot_oid,
            appointment_id=created.id
        )

        from_time = target_slot.from_time
        if isinstance(from_time, str):
            from_time = datetime.fromisoformat(from_time.replace('Z', '+00:00'))

        formatted_time = from_time.strftime("%d/%m/%Y %H:%M") if isinstance(from_time, datetime) else "невідомий час"

        if hasattr(dto, 'note') and dto.note:
            note = {
                "source": "PATIENT",
                "message": dto.note,
                "type": "SPECIFICATION",
                "createdAt": datetime.now(timezone.utc),
            }
            self.appointment_repository.add_note(created.id, note)

        if self.notification_service:
            self.notification_service.send_appointment_notification(
                recipient_id=str(doctor_oid),
                message=f"До вас записався пацієнт на {formatted_time}",
                appointment_id=str(created.id),
            )
            self.notification_service.send_appointment_notification(
                recipient_id=str(patient_oid),
                message=f"Запис до лікаря на {formatted_time} підтверджено.",
                appointment_id=str(created.id),
            )

        if self.account_service and final_price > 0:
            try:
                points_available = 0
                if self.reward_repository:
                    rewards = self.reward_repository.get_by_patient_id(patient_oid)
                    points_available = sum(
                        r.points for r in rewards
                        if r.type.value == "BONUS"
                    )

                payment = await self.account_service.pay_for_appointment_combined(
                    patient_id=patient_id,
                    appointment_id=str(created.id),
                    amount=final_price,
                    doctor_name=str(doctor_oid),
                    points_available=points_available,
                    payment_method=getattr(dto, "payment_method", "MONEY"),
                )

                if self.reward_repository and payment.get("points_used", 0) > 0:
                    self.reward_repository.spend_points(
                        patient_id=patient_oid,
                        points=payment["points_used"],
                        description=f"Оплата візиту {str(created.id)}"
                    )

                self.appointment_repository.update_payment_status(created.id, "PAID", payment.get("invoice_id"))
                created.payment_status = "PAID"
            except Exception as e:
                print(f"DEBUG exception type={type(e).__name__}, message={e}")
                self.appointment_repository.delete(created.id)
                self.schedule_repository.unbook_slot(schedule_id=target_schedule.id, slot_id=slot_oid)
                raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail=str(e))

        return {"appointment_id": str(created.id)}

    def get_appointment_by_id(self, appointment_id: str) -> dict:
        try:
            oid = ObjectId(appointment_id)
        except (InvalidId, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID")
        appointment = self.appointment_repository.get_by_id(oid)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запис не знайдено")
        return self._format_appointment(appointment)

    def get_appointments_by_patient_id(self, patient_id: str) -> list[dict]:
        try:
            oid = ObjectId(patient_id)
        except (InvalidId, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID пацієнта")
        return [self._format_appointment(app) for app in self.appointment_repository.get_by_patient_id(oid)]

    def get_appointments_by_doctor_id(self, doctor_id: str) -> list[dict]:
        try:
            oid = ObjectId(doctor_id)
        except (InvalidId, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID лікаря")
        return [self._format_appointment(app) for app in self.appointment_repository.get_by_doctor_id(oid)]

    def finish_appointment(self, appointment_id: str, doctor_id: str) -> dict:
        try:
            oid = ObjectId(appointment_id)
        except (InvalidId, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID")
        appointment = self.appointment_repository.get_by_id(oid)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Прийом не знайдено")
        if str(appointment.doctor_id) != doctor_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ви не є лікарем цього прийому")
        if appointment.status.value != "RESERVED":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Неможливо завершити прийом зі статусом {appointment.status.value}")

        from_time = appointment.from_time
        if isinstance(from_time, str):
            from_time = datetime.fromisoformat(from_time.replace('Z', '+00:00'))

        now = datetime.now(timezone.utc)
        if now < from_time.replace(tzinfo=timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Прийом ще не почався")

        self.appointment_repository.update_status(oid, "FINISHED")
        if self.reward_repository and appointment.patient_id:
            if not self.reward_repository.has_first_visit_bonus(appointment.patient_id):
                reward = Reward(
                    patientId=appointment.patient_id,
                    type=RewardType.BONUS,
                    points=100,
                    source=RewardSource.FIRST_VISIT_BONUS,
                    description="Бонус за перший завершений візит"
                )
                self.reward_repository.create(reward)
        return {"status": "FINISHED", "appointment_id": appointment_id}

    def cancel_appointment(self, appointment_id: str, canceller_id: str, role: str, reason: str = None) -> dict:
        try:
            oid = ObjectId(appointment_id)
        except (InvalidId, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID")

        appointment = self.appointment_repository.get_by_id(oid)
        if not appointment:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Прийом не знайдено")

        if role == "PATIENT" and str(appointment.patient_id) != canceller_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Немає доступу до цього візиту")
        if role == "DOCTOR" and str(appointment.doctor_id) != canceller_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Ви не є лікарем цього прийому")

        if appointment.status.value != "RESERVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неможливо скасувати прийом зі статусом {appointment.status.value}"
            )

        if role == "PATIENT":
            from_time = appointment.from_time
            if isinstance(from_time, str):
                from_time = datetime.fromisoformat(from_time.replace('Z', '+00:00'))
            if from_time.tzinfo is None:
                from_time = from_time.replace(tzinfo=timezone.utc)
            if (from_time - datetime.now(timezone.utc)).total_seconds() / 3600 < 2:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Скасування неможливе — до прийому менше 2 годин"
                )

        self.appointment_repository.update_status(oid, "CANCELLED")

        slot_freed = False
        schedules = self.schedule_repository.get_by_doctor_id(appointment.doctor_id)
        for schedule in schedules:
            for slot in schedule.slots:
                if str(slot.id) == str(appointment.slot_id):
                    self.schedule_repository.unbook_slot(schedule_id=schedule.id, slot_id=appointment.slot_id)
                    slot_freed = True
                    break

        cancelled_by = "PATIENT" if role == "PATIENT" else "DOCTOR"
        notify_user_id = str(appointment.doctor_id) if role == "PATIENT" else str(appointment.patient_id)
        reason_text = reason or ("Скасовано пацієнтом" if role == "PATIENT" else "Скасовано лікарем")

        if self.notification_service:
            self.notification_service.send_appointment_notification(
                recipient_id=notify_user_id,
                message=f"Візит {appointment_id} скасовано. Причина: {reason_text}",
                appointment_id=appointment_id,
                extra={
                    "cancelled_by": cancelled_by,
                    "canceller_id": canceller_id,
                    "reason": reason_text,
                    "slot_freed": slot_freed,
                }
            )
            self.notification_service.send_appointment_notification(
                recipient_id=canceller_id,
                message=f"Ви скасували візит {appointment_id}. Причина: {reason_text}",
                appointment_id=appointment_id,
                extra={
                    "cancelled_by": cancelled_by,
                    "canceller_id": canceller_id,
                    "reason": reason_text,
                    "slot_freed": slot_freed,
                }
            )
            if self.user_repository:
                admins = self.user_repository.get_by_role("ADMIN")
                for admin in admins:
                    self.notification_service.send_appointment_notification(
                        recipient_id=str(admin.id),
                        message=f"Візит {appointment_id} скасовано користувачем {canceller_id}. Причина: {reason_text}",
                        appointment_id=appointment_id,
                        extra={
                            "cancelled_by": cancelled_by,
                            "canceller_id": canceller_id,
                            "affected_user_id": notify_user_id,
                            "reason": reason_text,
                            "slot_freed": slot_freed,
                        }
                    )

        return {
            "status": "CANCELLED",
            "appointment_id": appointment_id,
            "cancelled_by": cancelled_by,
            "reason": reason_text,
            "slot_freed": slot_freed,
        }

    def _format_appointment(self, appointment: Appointment) -> dict:
        notes = getattr(appointment, "notes", [])
        return {
            "_id": str(appointment.id),
            "patientId": str(appointment.patient_id),
            "doctorId": str(appointment.doctor_id),
            "slotId": str(appointment.slot_id),
            "from": appointment.from_time.isoformat() if hasattr(appointment.from_time,
                                                                 "isoformat") else appointment.from_time,
            "to": appointment.to_time.isoformat() if hasattr(appointment.to_time, "isoformat") else appointment.to_time,
            "status": appointment.status.value if hasattr(appointment.status, "value") else appointment.status,
            "paymentStatus": getattr(appointment, "payment_status", "PENDING"),
            "basePrice": getattr(appointment, "base_price", 0),
            "finalPrice": getattr(appointment, "final_price", 0),
            "appointmentType": getattr(appointment, "appointment_type", "VISIT"),
            "notes": [
                {
                    "source": n.source.value if hasattr(n.source, "value") else n.source,
                    "message": n.message,
                    "type": n.type.value if hasattr(n.type, "value") else n.type,
                    "createdAt": n.created_at.isoformat() if hasattr(n.created_at, "isoformat") else n.created_at,
                }
                for n in notes
            ],
        }

    def add_patient_note(self, appointment_id: str, patient_id: str, message: str) -> dict:
        oid = ObjectId(appointment_id)
        appointment = self.appointment_repository.get_by_id(oid)
        if not appointment or str(appointment.patient_id) != patient_id:
            raise HTTPException(status_code=404, detail="Прийом не знайдено або доступ заборонено")
        note = {"source": "PATIENT", "message": message, "type": "SPECIFICATION",
                "createdAt": datetime.now(timezone.utc)}
        self.appointment_repository.add_note(oid, note)
        return {"status": "ok", "note": note}

    def add_doctor_receipt(self, appointment_id: str, doctor_id: str, message: str) -> dict:
        oid = ObjectId(appointment_id)
        appointment = self.appointment_repository.get_by_id(oid)
        if not appointment or str(appointment.doctor_id) != doctor_id:
            raise HTTPException(status_code=404, detail="Прийом не знайдено або доступ заборонено")
        note = {"source": "DOCTOR", "message": message, "type": "RECEIPT", "createdAt": datetime.now(timezone.utc)}
        self.appointment_repository.add_note(oid, note)
        return {"status": "ok", "note": note}
