from modules.users_module.domains.user.User import User
from modules.users_module.application.dto.UserResponse import UserResponse, ProfileResponse
from modules.users_module.application.dto.PatientResponse import PatientResponse


class UserMapper:

    @staticmethod
    def normalize_role(role) -> str:
        return role.value if hasattr(role, "value") else role

    @staticmethod
    def to_user_response(user: User) -> UserResponse:
        profile = None

        if user.profile:
            profile = ProfileResponse(
                fullName=user.profile.full_name,
                phone=user.profile.phone,
                specializationId=str(user.profile.specialization_id)
                if user.profile.specialization_id else None,
                avatarUrl=user.profile.avatar_url,
            )

        return UserResponse(
            _id=str(user.id),
            email=user.email,
            role=UserMapper.normalize_role(user.role),
            isActive=user.is_active,
            profile=profile,
            createdAt=user.created_at,
            updatedAt=user.updated_at,
            lastLoginAt=user.last_login_at,
        )

    @staticmethod
    def to_patient_response(user: User) -> PatientResponse:
        profile = user.profile

        return PatientResponse(
            _id=str(user.id),
            email=user.email,
            isActive=user.is_active,
            fullName=profile.full_name if profile else None,
            phone=profile.phone if profile else None,
            avatarUrl=profile.avatar_url if profile else None,
            createdAt=user.created_at,
            lastLoginAt=user.last_login_at,
        )
