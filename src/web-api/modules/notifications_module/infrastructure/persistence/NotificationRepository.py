from datetime import datetime, timezone
from typing import Optional
from bson import ObjectId

from config.db import db

collection = db["notifications"]


def create_notification(message: str, recipient_id: Optional[str]) -> dict:
    """
    Зберігає нове сповіщення в БД.
    recipient_id=None означає broadcast для всіх.
    """
    doc = {
        "message": message,
        "recipient_id": recipient_id,
        "is_read_by": [],          # список user_id які прочитали (для broadcast)
        "is_read": False,          # для персональних
        "sent_at": datetime.now(timezone.utc),
    }
    result = collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


def get_notifications_for_user(user_id: str) -> list[dict]:
    cursor = collection.find({
        "$or": [
            {"recipient_id": user_id},
            {"recipient_id": {"$in": [None, ""]}},
            {"recipient_id": {"$exists": False}},
        ]
    }).sort("sent_at", -1)
    return list(cursor)

def mark_all_as_read(user_id: str) -> int:
    """
    Позначає всі непрочитані сповіщення юзера як прочитані.
    """
    # 1. Персональні
    personal_result = collection.update_many(
        {"recipient_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )

    # 2. Broadcast (ВИПРАВЛЕНО: додано $or для точного збігу з логікою пошуку)
    broadcast_result = collection.update_many(
        {
            "$or": [
                {"recipient_id": None},
                {"recipient_id": ""},
                {"recipient_id": {"$exists": False}}
            ],
            "is_read_by": {"$ne": user_id}
        },
        {"$addToSet": {"is_read_by": user_id}}
    )

    return personal_result.modified_count + broadcast_result.modified_count

def _is_read_by_user(notification: dict, user_id: str) -> bool:
    """Перевіряє чи прочитав юзер конкретне сповіщення."""
    if notification.get("recipient_id") is None:
        # broadcast
        return user_id in notification.get("is_read_by", [])
    return notification.get("is_read", False)
