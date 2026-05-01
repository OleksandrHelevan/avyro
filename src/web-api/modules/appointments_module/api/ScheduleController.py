from fastapi import APIRouter, HTTPException, Depends, status

from config.dependencies import get_schedule_service
from config.security import get_current_user
from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.application.service.ScheduleService import ScheduleService

router = APIRouter(
    prefix="/schedules",
    tags=["Schedules"]
)

@router.post("/", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    dto: CreateScheduleDTO,
    service: ScheduleService = Depends(get_schedule_service),
    current_user: dict = Depends(get_current_user)
):
    try:
        return service.create_monthly_schedule(
            doctor_id=dto.doctorId,
            year=dto.year,
            month=dto.month,
            dto=dto
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
