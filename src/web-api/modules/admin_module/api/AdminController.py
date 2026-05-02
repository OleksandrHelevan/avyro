from fastapi import APIRouter, Depends, status
from typing import List

from config.db import db
from config.permissions import allow_admin
from config.dependencies import get_schedule_service
from modules.admin_module.application.service.AdminRequestService import AdminRequestService
from modules.admin_module.infrastructure.persistence.RequestRepository import RequestRepository
from modules.users_module.api.SpecializationController import get_specialization_service
from modules.users_module.application.dto.SpecializationDto import SpecializationResponse, CreateSpecializationRequest
from modules.users_module.application.services.SpecializationService import SpecializationService
from modules.users_module.infrastructure.persistence.RewardRepository import RewardRepository
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.users_module.application.services.PatientService import PatientService

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

def get_admin_request_service(
    schedule_service=Depends(get_schedule_service)
) -> AdminRequestService:

    request_repo = RequestRepository(db["Requests"])
    user_repo = UserRepository(db["Users"])
    reward_repo = RewardRepository(db["Rewards"])

    user_service = PatientService(
        user_repo,
        request_repo,
        reward_repo
    )

    return AdminRequestService(
        request_repo,
        user_service,
        schedule_service
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


@router.post("/{request_id}/reject", status_code=status.HTTP_200_OK)
async def reject_request(
    request_id: str,
    comment: str,
    service: AdminRequestService = Depends(get_admin_request_service),
    current_admin: dict = Depends(allow_admin)
):
    from bson import ObjectId
    from modules.admin_module.domains.Request import RequestStatus

    success = service.request_repo.update_status(
        ObjectId(request_id),
        RequestStatus.REJECTED,
        ObjectId(current_admin["sub"]),
        comment
    )
    return {"status": "success" if success else "failed"}


@router.post("/specializations", response_model=SpecializationResponse, status_code=status.HTTP_201_CREATED)
async def create_specialization(
    request: CreateSpecializationRequest,
    current_admin: dict = Depends(allow_admin),
    service: SpecializationService = Depends(get_specialization_service)
):

    return service.create_specialization(request)
