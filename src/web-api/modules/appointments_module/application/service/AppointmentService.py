from bson import ObjectId
from bson.errors import InvalidId
from fastapi import HTTPException, status
from datetime import datetime, timezone

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

    def book_appointment(self, slot_id: str, patient_id: str) -> dict:
        try:
            slot_oid = ObjectId(slot_id)
            patient_oid = ObjectId(patient_id)
        except (InvalidId, TypeError):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Невалідний формат ID"
            )

        # Знаходимо розклад який містить цей слот
        schedule = self.schedule_repository.get_by_slot_id(slot_oid)
        if not schedule:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Слот не знайдено"
            )

        # Знаходимо сам слот всередині розкладу
        target_slot = None
        for slot in schedule.slots:
            if str(slot.id) == str(slot_oid):
                target_slot = slot
                break

        if not target_slot:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Слот не знайдено в розкладі"
            )

        if target_slot.slot_type != SlotType.AVAILABLE:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Цей слот вже зайнятий або недоступний"
            )

        # Створюємо апойнтмент
        appointment = Appointment(
            patient_id=patient_oid,
            slot_id=slot_oid,
            doctor_id=schedule.doctor_id,
            from_time=target_slot.from_time,
            to_time=target_slot.to_time,
        )
        created = self.appointment_repository.create(appointment)

        # Блокуємо слот в розкладі
        self.schedule_repository.book_slot(
            schedule_id=schedule.id,
            slot_id=slot_oid,
            appointment_id=created.id
        )

        return {
            "_id": str(created.id),
            "patientId": str(created.patient_id),
            "doctorId": str(created.doctor_id),
            "slotId": str(created.slot_id),
            "from": created.from_time.isoformat() if hasattr(created.from_time, "isoformat") else created.from_time,
            "to": created.to_time.isoformat() if hasattr(created.to_time, "isoformat") else created.to_time,
            "status": created.status.value,
        }

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

        return {
            "_id": str(appointment.id),
            "patientId": str(appointment.patient_id),
            "doctorId": str(appointment.doctor_id),
            "slotId": str(appointment.slot_id),
            "from": appointment.from_time.isoformat() if hasattr(appointment.from_time,
                                                                 "isoformat") else appointment.from_time,
            "to": appointment.to_time.isoformat() if hasattr(appointment.to_time, "isoformat") else appointment.to_time,
            "status": appointment.status.value,
        }
