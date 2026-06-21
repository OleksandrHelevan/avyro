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
    FIRST_VISIT_BONUS = "FIRST_VISIT_BONUS"
    APPOINTMENT_PAYMENT = "APPOINTMENT_PAYMENT"
    VISITS_10 = "VISITS_10"
    VISITS_100 = "VISITS_100"
    SAME_DOCTOR_3 = "SAME_DOCTOR_3"
    SAME_SPECIALIZATION_5 = "SAME_SPECIALIZATION_5"
    MONTHLY_VISITS_10 = "MONTHLY_VISITS_10"
    LOYALTY_1_YEAR = "LOYALTY_1_YEAR"
    LOYALTY_2_YEARS = "LOYALTY_2_YEARS"
    LOYALTY_6_MONTHS = "LOYALTY_6_MONTHS"
    APPOINTMENT = "APPOINTMENT"
    DOCTOR_VISIT_PAYOUT = "DOCTOR_VISIT_PAYOUT"
    REFUND = "REFUND"
    OTHER = "OTHER"

class Reward:
    def __init__(
        self,
        patientId: ObjectId,
        type: RewardType,
        points: int,
        source: RewardSource,
        description: str,
        id: Optional[ObjectId] = None,
        specializationId: Optional[ObjectId] = None,
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

        source_data = data.get("source", {})
        source_value = source_data.get("type") if isinstance(source_data, dict) else source_data

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
        source_names = {
            RewardSource.APPOINTMENT: "Нарахування за прийом",
            RewardSource.DOCTOR_VISIT_PAYOUT: "Виплата за проведений візит",
            RewardSource.REFUND: "Повернення за скасований візит",
        }
        source_name = source_names.get(self.source, "Заповнення профілю")
        return {
            "patientId": self.patientId,
            "type": self.type.value,
            "points": self.points,
            "source": {
                "name": source_name,
                "type": self.source.value
            },
            "description": self.description,
            "specializationId": self.specializationId or ObjectId(),
            "createdAt": self.createdAt
        }
