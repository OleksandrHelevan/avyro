from fastapi import APIRouter, Depends, status
from config.permissions import get_current_user, allow_admin
from config.dependencies import get_feedback_service
from modules.feedback_module.application.FeedbackService import FeedbackService
from modules.feedback_module.application.dto.FeedbackDTOs import CreateFeedbackRequest

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
