from typing import Optional
from bson import ObjectId
from datetime import datetime

from modules.users_module.domains.user.Profile import Profile
from modules.users_module.domains.user.UserRole import UserRole


class User:
    def __init__(
        self,
        email: str,
        password: str,
        role: UserRole,
        is_active: bool,
        profile: Optional[Profile],
        created_at: datetime,
        updated_at: datetime,
        _id: Optional[ObjectId] = None,
        last_login_at: Optional[datetime] = None,
        deleted_at: Optional[datetime] = None,
    ):
        self.id = _id
        self.email = email
        self.password = password
        self.role = role
        self.is_active = is_active
        self.profile = profile
        self.created_at = created_at
        self.updated_at = updated_at
        self.last_login_at = last_login_at
        self.deleted_at = deleted_at

    def to_dict(self) -> dict:
        data = {
            "email": self.email,
            "password": self.password,
            "role": self.role.value if hasattr(self.role, "value") else self.role,
            "isActive": self.is_active,
            "profile": self.profile.to_dict() if self.profile else None,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
            "lastLoginAt": self.last_login_at,
            "deletedAt": self.deleted_at,
        }

        if self.id:
            data["_id"] = self.id

        return data

    @staticmethod
    def from_dict(data: dict) -> "User":
        if not data:
            return None

        return User(
            _id=data.get("_id"),
            email=data.get("email"),
            password=data.get("password"),
            role=data.get("role"),
            is_active=data.get("isActive"),
            profile=Profile.from_dict(data.get("profile")),
            created_at=data.get("createdAt"),
            updated_at=data.get("updatedAt"),
            last_login_at=data.get("lastLoginAt"),
            deleted_at=data.get("deletedAt"),
        )
