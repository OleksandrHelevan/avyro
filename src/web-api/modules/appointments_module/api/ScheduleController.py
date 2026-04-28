from fastapi import APIRouter, HTTPException, Depends, status
from typing import List

from config.dependencies import get_schedule_service
from config.security import get_current_user
from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.application.dto.UpdateScheduleDTO import UpdateScheduleDTO
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
        return service.create_schedule(dto)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/doctor/{doctor_id}", response_model=List[dict])
async def get_doctor_schedules(
    doctor_id: str,
    service: ScheduleService = Depends(get_schedule_service),
    current_user: dict = Depends(get_current_user)
):
    return service.get_doctor_schedules(doctor_id)


@router.patch("/{schedule_id}", response_model=dict)
async def update_schedule(
    schedule_id: str,
    dto: UpdateScheduleDTO,
    service: ScheduleService = Depends(get_schedule_service),
    current_user: dict = Depends(get_current_user)
):
    updated = service.update_schedule(schedule_id, dto)
    if not updated:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return updated


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    schedule_id: str,
    service: ScheduleService = Depends(get_schedule_service),
    current_user: dict = Depends(get_current_user)
):
    success = service.delete_schedule(schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return None
