from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status

from modules.appointments_module.domains.appointment.Appointment import Appointment
from modules.appointments_module.domains.slot.Slot import SlotType
from modules.appointments_module.infrastructure.persistence.AppointmentRepository import AppointmentRepository
from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository


class AppointmentService:
    def __init__(
        self,
        appointment_repository: AppointmentRepository,
        schedule_repository: ScheduleRepository,
    ):
        self.appointment_repository = appointment_repository
        self.schedule_repository = schedule_repository

    # Додали doctor_id в аргументи
    def book_appointment(self, doctor_id: str, slot_id: str, patient_id: str) -> dict:
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

        # 4. Створюємо апойнтмент
        appointment = Appointment(
            patient_id=patient_oid,
            slot_id=slot_oid,
            doctor_id=doctor_oid, # Використовуємо doctor_oid
            from_time=target_slot.from_time,
            to_time=target_slot.to_time,
        )
        created = self.appointment_repository.create(appointment)

        # 5. Блокуємо слот у правильному розкладі
        self.schedule_repository.book_slot(
            schedule_id=target_schedule.id,
            slot_id=slot_oid,
            appointment_id=created.id
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
