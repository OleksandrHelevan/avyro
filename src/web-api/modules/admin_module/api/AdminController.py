from fastapi import APIRouter, Depends, status
from typing import List
from bson import ObjectId

from config.dependencies import get_admin_request_service
from config.permissions import allow_admin
from modules.admin_module.application.service.AdminRequestService import AdminRequestService
from modules.requests_module.domains.Request import RequestStatus

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


@router.get("/registrations", response_model=List[dict])
async def get_registration_requests(
    service: AdminRequestService = Depends(get_admin_request_service),
    current_admin: dict = Depends(allow_admin)
):
    return [req.to_dict() for req in service.get_all_registration_requests()]


@router.get("/schedules", response_model=List[dict])
async def get_schedule_requests(
    service: AdminRequestService = Depends(get_admin_request_service),
    current_admin: dict = Depends(allow_admin)
):
    return [req.to_dict() for req in service.get_all_schedule_requests()]


@router.get("/specializations", response_model=List[dict])
async def get_specialization_requests(
    service: AdminRequestService = Depends(get_admin_request_service),
    current_admin: dict = Depends(allow_admin)
):
    return [req.to_dict() for req in service.get_all_specialization_requests()]


@router.post("/{request_id}/approve-registration", status_code=status.HTTP_200_OK)
async def approve_doctor_registration(
    request_id: str,
    service: AdminRequestService = Depends(get_admin_request_service),
    current_admin: dict = Depends(allow_admin)
):
    return service.approve_registration(request_id, current_admin["sub"])


@router.post("/{request_id}/approve-schedule", status_code=status.HTTP_200_OK)
async def approve_schedule_creation(
    request_id: str,
    service: AdminRequestService = Depends(get_admin_request_service),
    current_admin: dict = Depends(allow_admin)
):
    return service.approve_schedule(request_id, current_admin["sub"])


@router.post("/{request_id}/approve-specialization", status_code=status.HTTP_200_OK)
async def approve_specialization_creation(
    request_id: str,
    service: AdminRequestService = Depends(get_admin_request_service),
    current_admin: dict = Depends(allow_admin)
):
    return service.approve_specialization(request_id, current_admin["sub"])


@router.post("/{request_id}/reject", status_code=status.HTTP_200_OK)
async def reject_request(
    request_id: str,
    comment: str,
    service: AdminRequestService = Depends(get_admin_request_service),
    current_admin: dict = Depends(allow_admin)
):
    success = service.request_repo.update_status(
        ObjectId(request_id),
        RequestStatus.REJECTED,
        ObjectId(current_admin["sub"]),
        comment
    )
    return {"status": "success" if success else "failed"}
