from fastapi import APIRouter, Depends, status
from config.dependencies import get_appointment_service
from config.permissions import RoleChecker, allow_patient
from modules.appointments_module.application.service.AppointmentService import AppointmentService
from pydantic import BaseModel

router = APIRouter(prefix="/appointments", tags=["Appointments"])

from config.permissions import RoleChecker, allow_patient

class BookAppointmentRequest(BaseModel):
    slotId: str


@router.post("", status_code=status.HTTP_201_CREATED)
async def book_appointment(
    body: BookAppointmentRequest,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_patient)
):
    return service.book_appointment(
        slot_id=body.slotId,
        patient_id=str(current_user["sub"])
    )

@router.get("/{appointment_id}", status_code=status.HTTP_200_OK)
async def get_appointment(
    appointment_id: str,
    service: AppointmentService = Depends(get_appointment_service),
    current_user: dict = Depends(allow_patient)
):
    return service.get_appointment_by_id(appointment_id)
