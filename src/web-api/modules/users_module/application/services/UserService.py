from datetime import datetime, UTC
from typing import Optional
from bson import ObjectId

from modules.users_module.application.dto.CreateUserRequest import CreateUserRequest
from modules.users_module.application.dto.UserResponse import UserResponse, ProfileResponse
from modules.users_module.domains.user.User import User
from modules.users_module.domains.user.Profile import Profile
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from config.security import hash_password

class UserAlreadyExistsException(Exception):
    pass

class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def _to_response(self, user: User) -> UserResponse:
        profile_response = None

        if user.profile:
            profile_response = ProfileResponse(
                fullName=user.profile.full_name,
                phone=user.profile.phone,
                specializationId=str(user.profile.specialization_id)
                if user.profile.specialization_id else None,
                avatarUrl=user.profile.avatar_url,
            )

        return UserResponse(
            _id=str(user.id),
            email=user.email,
            role=user.role,
            isActive=user.is_active,
            profile=profile_response,
            createdAt=user.created_at,
            updatedAt=user.updated_at,
            lastLoginAt=user.last_login_at,
        )

    def create_user(self, request: CreateUserRequest) -> UserResponse:
        if self.user_repository.get_by_email(request.email):
            raise UserAlreadyExistsException(f"Email {request.email} is taken")

        now = datetime.now(UTC)

        domain_profile = None
        if request.profile:
            domain_profile = Profile(
                full_name=request.profile.fullName,
                phone=request.profile.phone,
                specialization_id=ObjectId(request.profile.specializationId)
                if request.profile.specializationId else None,
                avatar_url=request.profile.avatarUrl,
            )

        user = User(
            email=request.email,
            password=hash_password(request.password),  # Хешуємо 1 раз
            role=request.role,
            is_active=request.isActive,
            profile=domain_profile,
            created_at=now,
            updated_at=now,
        )

        saved_user = self.user_repository.create(user)
        return self._to_response(saved_user)

    def get_user_by_id(self, user_id: str) -> Optional[UserResponse]:
        user = self.user_repository.get_by_id(user_id)
        return self._to_response(user) if user else None

    def get_user_by_email(self, email: str) -> Optional[UserResponse]:
        user = self.user_repository.get_by_email(email)
        return self._to_response(user) if user else None
