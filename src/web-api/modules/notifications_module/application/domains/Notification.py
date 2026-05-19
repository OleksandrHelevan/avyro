from datetime import datetime, timezone
from typing import Optional


class Notification:
    def __init__(
        self,
        message: str,
        recipient_id: Optional[str],   # None = для всіх
        created_at: Optional[datetime] = None,
        is_read: bool = False,
        id: Optional[str] = None,
    ):
        self.id = id
        self.message = message
        self.recipient_id = recipient_id  # None означає broadcast (всім)
        self.created_at = created_at or datetime.now(timezone.utc)
        self.is_read = is_read
