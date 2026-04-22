from datetime import datetime, UTC
from bson import ObjectId

from modules.users_module.domains.user.User import User
from modules.users_module.domains.user.Profile import Profile

from modules.users_module.application.mapper.UserMapper import UserMapper
from modules.users_module.api.exception.exceptions import (
    UserNotFoundException,
    ForbiddenException,
    InvalidUserIdException,
    UserAlreadyExistsException
)

from config.security import hash_password


class UserService:
    def __init__(self, user_repository):
        self.user_repository = user_repository

    def _to_object_id(self, user_id: str) -> ObjectId:
        try:
            return ObjectId(user_id)
        except Exception:
            raise InvalidUserIdException("Invalid user id")

    def create_user(self, request):
        existing = self.user_repository.get_by_email(request.email)
        if existing:
            raise UserAlreadyExistsException("Email already exists")

        now = datetime.now(UTC)

        profile = None
        if request.profile:
            profile = Profile(
                full_name=request.profile.fullName,
                phone=request.profile.phone,
                specialization_id=ObjectId(request.profile.specializationId)
                if request.profile.specializationId else None,
                avatar_url=request.profile.avatarUrl,
            )

        user = User(
            email=request.email,
            password=hash_password(request.password),
            role=request.role,
            is_active=request.isActive,
            profile=profile,
            created_at=now,
            updated_at=now,
        )

        saved = self.user_repository.create(user)
        return UserMapper.to_user_response(saved)

    def get_patient_profile(self, user_id: str):
        uid = self._to_object_id(user_id)

        user = self.user_repository.get_by_id(uid)
        if not user:
            raise UserNotFoundException("User not found")

        if UserMapper.normalize_role(user.role) != "PATIENT":
            raise ForbiddenException("Not a patient")

        return UserMapper.to_patient_response(user)

    def patch_patient_profile(self, user_id: str, request):
        uid = self._to_object_id(user_id)

        user = self.user_repository.get_by_id(uid)
        if not user:
            raise UserNotFoundException("User not found")

        if UserMapper.normalize_role(user.role) != "PATIENT":
            raise ForbiddenException("Not a patient")

        if user.profile is None:
            user.profile = Profile(full_name="")

        if request.fullName:
            user.profile.full_name = request.fullName
        if request.phone:
            user.profile.phone = request.phone
        if request.avatarUrl:
            user.profile.avatar_url = request.avatarUrl

        self.user_repository.update_profile(uid, user.profile.to_dict())

        updated = self.user_repository.get_by_id(uid)

        return UserMapper.to_patient_response(updated)
