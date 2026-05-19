from typing import Optional

from modules.notifications_module.application.dto.NotificationDTO import (
    NotificationResponse,
    NotificationsListResponse,
)
from modules.notifications_module.infrastructure.persistence import NotificationRepository


class NotificationService:

    def send_notification(self, message: str, recipient_id: Optional[str]) -> NotificationResponse:
        doc = NotificationRepository.create_notification(message, recipient_id)
        return self._to_response(doc, recipient_id)

    def get_notifications(self, user_id: str) -> NotificationsListResponse:
        docs = NotificationRepository.get_notifications_for_user(user_id)

        notifications = [
            NotificationResponse(
                id=str(doc["_id"]),
                message=doc["message"],
                is_read=NotificationRepository._is_read_by_user(doc, user_id),
                sent_at=doc["sent_at"],
                recipient_id=doc.get("recipient_id"),
            )
            for doc in docs
        ]

        unread_count = sum(1 for n in notifications if not n.is_read)

        return NotificationsListResponse(
            notifications=notifications,
            unread_count=unread_count,
        )

    def read_all(self, user_id: str) -> dict:
        count = NotificationRepository.mark_all_as_read(user_id)
        return {"marked_as_read": count}

    @staticmethod
    def _to_response(doc: dict, recipient_id: Optional[str]) -> NotificationResponse:
        return NotificationResponse(
            id=str(doc["_id"]),
            message=doc["message"],
            is_read=False,
            sent_at=doc["sent_at"],
            recipient_id=recipient_id,
        )
