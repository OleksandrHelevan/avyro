from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from modules.appointments_module.domains.appointment.Appointment import Appointment
from modules.appointments_module.domains.slot.Slot import SlotType
from modules.appointments_module.infrastructure.persistence import SlotRepository
from modules.appointments_module.application.dto.CreateAppointmentRequest import CreateAppointmentRequest
from modules.appointments_module.infrastructure.persistence.AppointmentRepository import AppointmentRepository
from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository
from modules.appointments_module.domains.schedule.Schedule import Schedule
from modules.appointments_module.domains.slot.Slot import Slot
from datetime import datetime, timezone
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
    ):
        self.appointment_repository = appointment_repository
        self.schedule_repository = schedule_repository
        self.account_service = account_service
        self.reward_repository = reward_repository

    # Додали doctor_id в аргументи
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

        # 1. Знаходимо всі розклади цього лікаря
        schedules = self.schedule_repository.get_by_doctor_id(doctor_oid)
        if not schedules:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Розклад для цього лікаря не знайдено"
            )

        # 2. Шукаємо потрібний слот у знайдених розкладах
        target_schedule = None
        target_slot = None

        for schedule in schedules:
            for slot in schedule.slots:
                # Надійно порівнюємо через string
                if str(slot.id) == str(slot_oid):
                    target_schedule = schedule
                    target_slot = slot
                    break
            if target_slot:
                break # Якщо знайшли, виходимо з зовнішнього циклу

        if not target_slot or not target_schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Слот не знайдено в розкладах лікаря"
            )

        # 3. Перевіряємо доступність слота
        if target_slot.slot_type != SlotType.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Цей слот вже зайнятий або недоступний"
            )

        price = target_schedule.price_per_slot

        final_price = price
        if dto.is_discount_used and dto.discount > 0:
            final_price = price * (1 - dto.discount / 100)


        # 4. Створюємо апойнтмент
        appointment = Appointment(
            patient_id=patient_oid,
            slot_id=slot_oid,
            doctor_id=doctor_oid,
            from_time=target_slot.from_time,
            to_time=target_slot.to_time,
            base_price=price,
            discount=dto.discount,
            is_discount_used=dto.is_discount_used,
            final_price=round(final_price, 2)
        )
        created = self.appointment_repository.create(appointment)

        # 5. Блокуємо слот у правильному розкладі
        self.schedule_repository.book_slot(
            schedule_id=target_schedule.id,
            slot_id=slot_oid,
            appointment_id=created.id
        )

        # 6. Оплата візиту
        if self.account_service and final_price > 0:
            try:
                payment = await self.account_service.pay_for_appointment(
                    patient_id=patient_id,
                    appointment_id=str(created.id),
                    amount=final_price,
                    doctor_name=str(doctor_id),
                )
                # Оновлюємо статус оплати
                self.appointment_repository.update_payment_status(
                    created.id, "PAID", payment["invoice_id"]
                )
                created.payment_status = "PAID"
            except ValueError as e:
                # Rollback — видаляємо appointment і розблоковуємо слот
                self.appointment_repository.delete(created.id)
                self.schedule_repository.unbook_slot(
                    schedule_id=target_schedule.id,
                    slot_id=slot_oid
                )
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=str(e)
                )

        return self._format_appointment(created)



    def get_appointment_by_id(self, appointment_id: str) -> dict:
        try:
            oid = ObjectId(appointment_id)
        except (InvalidId, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID"
            )

        appointment = self.appointment_repository.get_by_id(oid)

        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Запис не знайдено"
            )

        return self._format_appointment(appointment)

    def get_appointments_by_patient_id(self, patient_id: str) -> list[dict]:
        try:
            oid = ObjectId(patient_id)
        except (InvalidId, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID пацієнта"
            )

        appointments = self.appointment_repository.get_by_patient_id(oid)
        return [self._format_appointment(app) for app in appointments]

    def get_appointments_by_doctor_id(self, doctor_id: str) -> list[dict]:
        try:
            oid = ObjectId(doctor_id)
        except (InvalidId, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID лікаря"
            )

        appointments = self.appointment_repository.get_by_doctor_id(oid)
        return [self._format_appointment(app) for app in appointments]

    def finish_appointment(self, appointment_id: str, doctor_id: str) -> dict:
        try:
            oid = ObjectId(appointment_id)
        except (InvalidId, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID"
            )

        appointment = self.appointment_repository.get_by_id(oid)
        if not appointment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Прийом не знайдено"
            )

        # Перевіряємо що лікар є власником цього прийому
        if str(appointment.doctor_id) != doctor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ви не є лікарем цього прийому"
            )

        # Можна завершити тільки RESERVED прийом
        if appointment.status.value != "RESERVED":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Неможливо завершити прийом зі статусом {appointment.status.value}"
            )

        # Перевіряємо що прийом вже почався
        now = datetime.now(timezone.utc)
        from_time = appointment.from_time
        if from_time and from_time.tzinfo is None:
            from_time = from_time.replace(tzinfo=timezone.utc)

        if now < from_time:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Прийом ще не почався"
            )

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

    def _format_appointment(self, appointment: Appointment) -> dict:
        return {
            "_id": str(appointment.id),
            "patientId": str(appointment.patient_id),
            "doctorId": str(appointment.doctor_id),
            "slotId": str(appointment.slot_id),
            "from": appointment.from_time.isoformat() if hasattr(appointment.from_time, "isoformat") else appointment.from_time,
            "to": appointment.to_time.isoformat() if hasattr(appointment.to_time, "isoformat") else appointment.to_time,
            "status": appointment.status.value,
            "paymentStatus": getattr(appointment, "payment_status", "PENDING"),
            "basePrice": getattr(appointment, "base_price", 0),
            "finalPrice": getattr(appointment, "final_price", 0),
            "appointmentType": getattr(appointment, "appointment_type", "VISIT")
        }



