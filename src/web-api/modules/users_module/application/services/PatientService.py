from datetime import datetime, UTC
from bson import ObjectId

from modules.admin_module.domains.Request import Request, RequestType
from modules.users_module.domains.user.User import User
from modules.users_module.domains.user.Profile import Profile
from modules.users_module.application.mapper.PatientMapper import UserMapper
from modules.users_module.domains.user.UserRole import UserRole
from modules.users_module.api.exception.exceptions import (
    UserNotFoundException,
    ForbiddenException,
    InvalidUserIdException,
    UserAlreadyExistsException
)
from config.security import hash_password

# Імпортуємо доменні моделі нагород
from modules.users_module.domains.reward.Reward import Reward, RewardType, RewardSource


class PatientService:

    # ДОДАНО: reward_repository у конструктор
    def __init__(self, user_repository, request_repository, reward_repository):
        self.user_repository = user_repository
        self.request_repository = request_repository
        self.reward_repository = reward_repository

    def _to_object_id(self, user_id: str) -> ObjectId:
        try:
            return ObjectId(user_id)
        except Exception:
            raise InvalidUserIdException("Invalid user id")

    def create_user(self, request):
        existing_user = self.user_repository.get_by_email(request.email)
        if existing_user:
            raise UserAlreadyExistsException("Email already exists in our system")

        existing_request = self.request_repository.get_active_registration_by_email(request.email)
        if existing_request:
            msg = "Registration for this email is already pending or was approved"
            raise UserAlreadyExistsException(msg)

        if request.role == UserRole.DOCTOR:
            request_obj = Request(
                creator_id=None,
                type=RequestType.DOCTOR_REGISTRATION,
                payload=request.dict()
            )
            self.request_repository.create(request_obj)
            return {"status": "Чекаємо на відповідь адміністратора"}

        return self.create_user_final(request)

    def create_user_final(self, request):
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

        profile = user.profile

        # 1. Визначаємо статус заповненості профілю
        is_completed = False
        if profile:
            is_completed = bool(
                getattr(profile, "full_name", None) and
                getattr(profile, "phone", None) and
                getattr(profile, "avatar_url", None) and
                getattr(profile, "address", None)
            )

        # 2. Отримуємо всі нагороди користувача
        user_rewards = self.reward_repository.get_by_patient_id(uid)
        rewards_response = [
            {
                "_id": str(r.id),
                "type": r.type.value,
                "points": r.points,
                "source": r.source.value,
                "description": r.description,
                "createdAt": r.createdAt
            } for r in user_rewards
        ]

        # 3. Повертаємо об'єкт із новими полями
        # Оновлений return для get_patient_profile ТА patch_patient_profile
        return {
            "_id": str(user.id),
            "email": user.email,
            "isActive": getattr(user, "is_active", True),  # <-- ДОДАНО
            "createdAt": getattr(user, "created_at", None),  # <-- ДОДАНО
            "fullName": getattr(user.profile, "full_name", None) if hasattr(user, "profile") and user.profile else None,
            "phone": getattr(user.profile, "phone", None) if hasattr(user, "profile") and user.profile else None,
            "avatarUrl": getattr(user.profile, "avatar_url", None) if hasattr(user,
                                                                              "profile") and user.profile else None,
            "address": getattr(user.profile, "address", None) if hasattr(user, "profile") and user.profile else None,
            "isProfileCompleted": is_completed,
            "rewards": rewards_response
        }


    def patch_patient_profile(self, user_id: str, request):
        uid = self._to_object_id(user_id)

        user = self.user_repository.get_by_id(uid)
        if not user:
            raise UserNotFoundException("User not found")

        if UserMapper.normalize_role(user.role) != "PATIENT":
            raise ForbiddenException("Not a patient")

        if user.profile is None:
            user.profile = Profile(full_name="")

        # 1. Оновлюємо дані профілю (включаючи адресу)
        if hasattr(request, "fullName") and request.fullName is not None:
            user.profile.full_name = request.fullName
        if hasattr(request, "phone") and request.phone is not None:
            user.profile.phone = request.phone
        if hasattr(request, "avatarUrl") and request.avatarUrl is not None:
            user.profile.avatar_url = request.avatarUrl
        if hasattr(request, "address") and request.address is not None:
            user.profile.address = request.address

        # Зберігаємо профіль у базі
        self.user_repository.update_profile(uid, user.profile.to_dict())

        # 2. Перевіряємо, чи всі 4 поля тепер заповнені
        is_completed = bool(
            getattr(user.profile, "full_name", None) and
            getattr(user.profile, "phone", None) and
            getattr(user.profile, "avatar_url", None) and
            getattr(user.profile, "address", None)
        )

        # 3. Якщо заповнено і ще немає бонусу — створюємо винагороду
        if is_completed and not self.reward_repository.has_profile_bonus(uid):
            new_reward = Reward(
                patientId=uid,
                type=RewardType.BONUS,
                points=100,
                source=RewardSource.PROFILE_BONUS,
                description="Бонус за повністю заповнений профіль"
            )
            self.reward_repository.create(new_reward)

        # 4. Формуємо список нагород для відповіді
        user_rewards = self.reward_repository.get_by_patient_id(uid)
        rewards_response = [
            {
                "_id": str(r.id),
                "type": r.type.value,
                "points": r.points,
                "source": r.source.value,
                "description": r.description,
                "createdAt": r.createdAt
            } for r in user_rewards
        ]

        # 5. Повертаємо оновлений профіль
        # Оновлений return для get_patient_profile ТА patch_patient_profile
        return {
            "_id": str(user.id),
            "email": user.email,
            "isActive": getattr(user, "is_active", True),  # <-- ДОДАНО
            "createdAt": getattr(user, "created_at", None),  # <-- ДОДАНО
            "fullName": getattr(user.profile, "full_name", None) if hasattr(user, "profile") and user.profile else None,
            "phone": getattr(user.profile, "phone", None) if hasattr(user, "profile") and user.profile else None,
            "avatarUrl": getattr(user.profile, "avatar_url", None) if hasattr(user,
                                                                              "profile") and user.profile else None,
            "address": getattr(user.profile, "address", None) if hasattr(user, "profile") and user.profile else None,
            "isProfileCompleted": is_completed,
            "rewards": rewards_response
        }
