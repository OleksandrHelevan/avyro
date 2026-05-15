from fastapi import APIRouter, Depends, status
from pydantic import BaseModel

from config.dependencies import get_appointment_service
from config.permissions import RoleChecker, allow_patient, allow_doctor
from modules.appointments_module.application.service.AppointmentService import AppointmentService

router = APIRouter(prefix="/appointments", tags=["Appointments"])

# Додаємо doctorId у запит
class BookAppointmentRequest(BaseModel):
    doctorId: str
    slotId: str

@router.post("", status_code=status.HTTP_201_CREATED)
async def book_appointment(
    body: BookAppointmentRequest,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_patient)
):
    return service.book_appointment(
        doctor_id=body.doctorId,
        slot_id=body.slotId,
        patient_id=str(current_user["sub"])
    )


@router.get("/patient/me", status_code=status.HTTP_200_OK)
async def get_my_patient_appointments(
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_patient)
):
    patient_id = str(current_user["sub"])
    return service.get_appointments_by_patient_id(patient_id)


@router.get("/doctor/me", status_code=status.HTTP_200_OK)
async def get_my_doctor_appointments(
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_doctor)
):
    doctor_id = str(current_user["sub"])
    return service.get_appointments_by_doctor_id(doctor_id)


@router.get("/{appointment_id}", status_code=status.HTTP_200_OK)
async def get_appointment(
    appointment_id: str,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_patient)
):
    return service.get_appointment_by_id(appointment_id)
