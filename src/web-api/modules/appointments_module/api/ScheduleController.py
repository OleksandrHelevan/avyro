from fastapi import APIRouter, HTTPException, Depends, status

from config.dependencies import get_schedule_service
from config.permissions import RoleChecker
from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.application.service.ScheduleService import ScheduleService

router = APIRouter(
    prefix="/schedules",
    tags=["Schedules"]
)

allow_doctor = RoleChecker(["DOCTOR"])

@router.post("/schedule/request", response_model=dict, status_code=status.HTTP_201_CREATED)
async def request_schedule_creation(
    dto: CreateScheduleDTO,
    service: ScheduleService = Depends(get_schedule_service),
    current_user: dict = Depends(allow_doctor)
):
    try:
        request_id = service.request_schedule_creation(dto)

        return {
            "status": "PENDING",
            "message": "Запит на створення розкладу надіслано на розгляд адміністратору",
            "requestId": request_id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Не вдалося створити запит: {str(e)}"
        )
