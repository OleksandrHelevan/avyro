from fastapi import APIRouter, Depends, HTTPException, status

from config.permissions import allow_admin
from config.security import get_current_user
from modules.notifications_module.application.dto.NotificationDTO import (
    CreateNotificationRequest,
    NotificationResponse,
    NotificationsListResponse,
)
from modules.notifications_module.application.service.NotificationService import NotificationService

router = APIRouter(tags=["Notifications"])

_service = NotificationService()


# ── Admin ──────────────────────────────────────────────────────────────────────

@router.post(
    "/admin/notification",
    response_model=NotificationResponse,
    status_code=status.HTTP_201_CREATED,
)
def send_notification(
    body: CreateNotificationRequest,
    current_user: dict = Depends(allow_admin),
):
    """
    Доступний лише адміністратору.
    recipient_id=None → надіслати всім.
    recipient_id=<id>  → надіслати конкретному юзеру.
    """
    return _service.send_notification(
        message=body.message,
        recipient_id=body.recipient_id,
    )


# ── User ───────────────────────────────────────────────────────────────────────

@router.get(
    "/notifications",
    response_model=NotificationsListResponse,
)
def get_notifications(
    current_user: dict = Depends(get_current_user),
):
    """
    Повертає всі сповіщення для поточного юзера (персональні + broadcast),
    а також кількість непрочитаних.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return _service.get_notifications(user_id)


@router.post(
    "/notifications/read-all",
    status_code=status.HTTP_200_OK,
)
def read_all_notifications(
    current_user: dict = Depends(get_current_user),
):
    """
    Позначає всі сповіщення поточного юзера як прочитані.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    return _service.read_all(user_id)
