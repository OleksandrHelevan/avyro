from datetime import datetime, timezone
from typing import Optional

class NotificationType:
    APPOINTMENT = "APPOINTMENT"
    GENERAL = "GENERAL"

class Notification:
    def __init__(
        self,
        message: str,
        recipient_id: Optional[str],
        created_at: Optional[datetime] = None,
        is_read: bool = False,
        id: Optional[str] = None,
        appointment_id: Optional[str] = None,
        notification_type: Optional[str] = None,
    ):
        self.id = id
        self.message = message
        self.recipient_id = recipient_id
        self.created_at = created_at or datetime.now(timezone.utc)
        self.is_read = is_read
        self.appointment_id = appointment_id
        self.notification_type = notification_type or NotificationType.GENERAL
