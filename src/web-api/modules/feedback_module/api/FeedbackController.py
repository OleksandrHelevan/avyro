from fastapi import APIRouter, Depends, status
from config.permissions import get_current_user, allow_admin
from config.dependencies import get_feedback_service
from modules.feedback_module.application.FeedbackService import FeedbackService
from modules.feedback_module.application.dto.FeedbackDTOs import CreateFeedbackRequest
from modules.feedback_module.application.dto.FeedbackDTOs import CreateDoctorReviewRequest

router = APIRouter(prefix="/feedback", tags=["Feedback"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_feedback(
    dto: CreateFeedbackRequest,
    service: FeedbackService = Depends(get_feedback_service),
    current_user: dict = Depends(get_current_user)
):
    return service.create_feedback(current_user["sub"], dto)


@router.get("/all", response_model=list)
async def get_all_feedback(
    service: FeedbackService = Depends(get_feedback_service),
    current_admin: dict = Depends(allow_admin)
):
    return service.get_all_feedback()

@router.post("/doctor-review", status_code=status.HTTP_201_CREATED)
async def create_doctor_review(
    dto: CreateDoctorReviewRequest,
    service: FeedbackService = Depends(get_feedback_service),
    current_user: dict = Depends(get_current_user)
):
    return service.create_doctor_review(current_user["sub"], dto)


@router.get("/doctor/{doctor_id}", response_model=list)
async def get_doctor_reviews(
    doctor_id: str,
    service: FeedbackService = Depends(get_feedback_service),
):
    return service.get_doctor_reviews(doctor_id)

