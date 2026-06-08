from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from fastapi import HTTPException


from config.dependencies import get_appointment_service
from config.permissions import allow_patient, allow_doctor
from config.security import get_current_user
from modules.appointments_module.application.service.AppointmentService import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])


class BookAppointmentRequest(BaseModel):
    doctorId: str
    slotId: str
    discount: float = 0.0
    is_discount_used: bool = False
    note: Optional[str] = None


class AddNoteRequest(BaseModel):
    message: str


@router.post("", status_code=status.HTTP_201_CREATED)
async def book_appointment(
    body: BookAppointmentRequest,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_patient)
):
    return await service.book_appointment(
        doctor_id=body.doctorId,
        slot_id=body.slotId,
        patient_id=str(current_user["sub"]),
        dto=body
    )


@router.get("/patient/me", status_code=status.HTTP_200_OK)
async def get_my_patient_appointments(
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_patient)
):
    return service.get_appointments_by_patient_id(str(current_user["sub"]))


@router.get("/doctor/me", status_code=status.HTTP_200_OK)
async def get_my_doctor_appointments(
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_doctor)
):
    return service.get_appointments_by_doctor_id(str(current_user["sub"]))


@router.post("/{appointment_id}/note", status_code=status.HTTP_201_CREATED)
async def add_note(
    appointment_id: str,
    body: AddNoteRequest,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(get_current_user)
):

    return service.add_note(
        appointment_id=appointment_id,
        user_id=str(current_user["sub"]),
        role=str(current_user.get("role", "")),
        message=body.message,
    )


@router.get("/{appointment_id}", status_code=status.HTTP_200_OK)
async def get_appointment(
    appointment_id: str,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(get_current_user)
):
    return service.get_appointment_by_id(appointment_id)


@router.post("/{appointment_id}/finish", status_code=status.HTTP_200_OK)
async def finish_appointment(
    appointment_id: str,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_doctor)
):
    return service.finish_appointment(
        appointment_id=appointment_id,
        doctor_id=str(current_user["sub"])
    )

@router.patch("/{appointment_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_appointment(
    appointment_id: str,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(get_current_user)
):
    appointment = service.get_by_id(appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Візит не знайдено")

    if str(appointment.patient_id) != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Немає доступу до цього візиту")

    slot = service.get_slot(appointment.slot_id)
    now = datetime.now(timezone.utc)
    time_until = (slot.from_time - now).total_seconds() / 3600

    if time_until < 2:
        raise HTTPException(
            status_code=400,
            detail="Скасування неможливе — до прийому менше 2 годин"
        )

    return service.cancel_appointment(appointment_id)


@router.patch("/{appointment_id}/cancel", status_code=status.HTTP_200_OK)
async def cancel_appointment(
    appointment_id: str,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(get_current_user)
):
    return service.cancel_appointment(appointment_id, current_user["sub"])
