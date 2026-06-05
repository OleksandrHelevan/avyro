from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class CreateNotificationRequest(BaseModel):
    message: str
    recipient_id: Optional[str] = None


class NotificationResponse(BaseModel):
    id: str
    message: str
    is_read: bool
    sent_at: datetime
    recipient_id: Optional[str] = None
    appointment_id: Optional[str] = None
    notification_type: Optional[str] = None


class NotificationsListResponse(BaseModel):
    notifications: list[NotificationResponse]
    unread_count: int
