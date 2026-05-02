from typing import Optional
from bson import ObjectId


class Profile:
    def __init__(
        self,
        full_name: str,
        phone: Optional[str] = None,
        specialization_id: Optional[ObjectId] = None,
        avatar_url: Optional[str] = None,
    ):
        self.full_name = full_name
        self.phone = phone
        self.specialization_id = specialization_id
        self.avatar_url = avatar_url

    def to_dict(self) -> dict:
        address: Optional[str] = None
        return {
            "fullName": self.full_name,
            "phone": self.phone,
            "specializationId": self.specialization_id,
            "avatarUrl": self.avatar_url,

        }

    @staticmethod
    def from_dict(data: dict) -> "Profile":
        if not data:
            return None

        return Profile(
            full_name=data.get("fullName"),
            phone=data.get("phone"),
            specialization_id=ObjectId(data["specializationId"])
            if data.get("specializationId") else None,
            avatar_url=data.get("avatarUrl"),
        )

    address: Optional[str] = None
