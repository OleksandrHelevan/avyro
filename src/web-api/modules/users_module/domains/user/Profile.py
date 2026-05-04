from typing import Optional
from bson import ObjectId

class Profile:
    def __init__(
        self,
        full_name: str,
        phone: Optional[str] = None,
        specialization_id: Optional[ObjectId] = None,
        avatar_url: Optional[str] = None,
        address: Optional[str] = None,
    ):
        self.full_name = full_name
        self.phone = phone
        self.specialization_id = specialization_id
        self.avatar_url = avatar_url
        self.address = address

    def to_dict(self) -> dict:
        return {
            "fullName": self.full_name,
            "phone": self.phone,
            "specializationId": self.specialization_id,
            "avatarUrl": self.avatar_url,
            "address": self.address,
        }

    @staticmethod
    def from_dict(data: dict) -> "Profile":
        if not data:
            return None

        return Profile(
            full_name=data.get("fullName") or data.get("full_name"),
            phone=data.get("phone"),
            specialization_id=data.get("specializationId") or data.get("specialization_id"),
            avatar_url=data.get("avatarUrl") or data.get("avatar_url"),
            address=data.get("address"),
        )
