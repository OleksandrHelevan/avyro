from enum import Enum
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId


class RewardType(str, Enum):
    SPEND = "SPEND"
    BONUS = "BONUS"
    PENALTY = "PENALTY"


class RewardSource(str, Enum):
    PROFILE_BONUS = "PROFILE_BONUS"


class Reward:
    def __init__(
        self,
        patientId: ObjectId,
        type: RewardType,
        points: int,
        source: RewardSource,
        description: str,
        id: Optional[ObjectId] = None,
        specializationId: Optional[ObjectId] = None,  # Додано для валідації БД
        createdAt: Optional[datetime] = None
    ):
        self.id = id
        self.patientId = patientId
        self.type = type
        self.points = points
        self.source = source
        self.description = description
        self.specializationId = specializationId
        self.createdAt = createdAt or datetime.now(timezone.utc)

    @classmethod
    def from_dict(cls, data: dict):
        if not data:
            return None

        # Витягуємо source безпечно.
        # ТЕПЕР ЧИТАЄМО ПОЛЕ "type" (де лежить "PROFILE_BONUS"), А НЕ "name"
        source_data = data.get("source", {})
        source_value = source_data.get("type") if isinstance(source_data, dict) else source_data

        # Додаткова перевірка, щоб уникнути помилок Enum
        try:
            valid_source = RewardSource(source_value) if source_value else RewardSource.PROFILE_BONUS
        except ValueError:
            valid_source = RewardSource.PROFILE_BONUS

        return cls(
            id=data.get("_id"),
            patientId=data.get("patientId"),
            type=RewardType(data.get("type")),
            points=data.get("points", 0),
            source=valid_source,
            description=data.get("description", ""),
            specializationId=data.get("specializationId"),
            createdAt=data.get("createdAt")
        )

    def to_dict(self):
        return {
            "patientId": self.patientId,
            "type": self.type.value,
            "points": self.points,
            # ДОДАНО: додаємо поле type всередину source, як просить БД
            "source": {
                "name": "Заповнення профілю", # Або можна залишити self.source.value
                "type": self.source.value     # Тепер тут буде "PROFILE_BONUS", як просить БД!
            },
            "description": self.description,
            # ДОДАНО: генеруємо новий ObjectId, якщо його немає, бо БД не приймає null
            "specializationId": self.specializationId or ObjectId(),
            "createdAt": self.createdAt
        }
