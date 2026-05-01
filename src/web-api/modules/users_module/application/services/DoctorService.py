import logging
from bson.errors import InvalidId
from bson.objectid import ObjectId
from fastapi import HTTPException, status

from modules.users_module.application.dto.DoctorProfile import (
    DoctorProfileUpdateRequest
)
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.users_module.infrastructure.persistence.SpecializationRepository import SpecializationRepository

logger = logging.getLogger(__name__)


class DoctorService:
    def __init__(self, user_repository: UserRepository, spec_repository: SpecializationRepository):
        self.user_repository = user_repository
        self.spec_repository = spec_repository

    def patch_doctor_profile(self, user_id: str, profile_data: DoctorProfileUpdateRequest) -> dict:
        try:
            user_oid = ObjectId(user_id)
            spec_oid = ObjectId(profile_data.specialization_id)
        except InvalidId:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID")

        specialization = self.spec_repository.get_by_id(spec_oid)
        if not specialization:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Оберіть вашу медичну спеціалізацію (такого фаху не знайдено)")

        user = self.user_repository.get_by_id(user_oid)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Лікаря не знайдено")

        if getattr(user, "role", "") != "DOCTOR":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Користувач не є лікарем")

        profile_update = {
            "fullName": profile_data.fullName,
            "full_name": profile_data.fullName,
            "phone": profile_data.phone,
            "avatarUrl": profile_data.avatarUrl,
            "avatar_url": profile_data.avatarUrl,
            "specialization_id": str(spec_oid)
        }
        self.user_repository.update_profile(user_oid, profile_update)

        updated_user = self.user_repository.get_by_id(user_oid)
        profile_obj = getattr(updated_user, "profile", None)

        def get_profile_attr(obj, attr_name):
            if not obj:
                return None
            if isinstance(obj, dict):
                return obj.get(attr_name)
            return getattr(obj, attr_name, None)

        return {
            "_id": str(updated_user.id),
            "email": updated_user.email,
            "isActive": getattr(updated_user, "is_active", True),
            "fullName": get_profile_attr(profile_obj, "fullName") or get_profile_attr(profile_obj, "full_name"),
            "phone": get_profile_attr(profile_obj, "phone"),
            "avatarUrl": get_profile_attr(profile_obj, "avatarUrl") or get_profile_attr(profile_obj, "avatar_url"),

            "createdAt": getattr(updated_user, "created_at", None),
            "lastLoginAt": getattr(updated_user, "last_login_at", None)
        }

    def get_doctor_by_id(self, user_id: str) -> dict:
        try:
            user_oid = ObjectId(user_id)
        except InvalidId:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID")

        user = self.user_repository.get_by_id(user_oid)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Лікаря не знайдено")

        if getattr(user, "role", "") != "DOCTOR":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Користувач не є лікарем")

        profile_obj = getattr(user, "profile", None)

        def get_profile_attr(obj, attr_name):
            if not obj:
                return None
            if isinstance(obj, dict):
                return obj.get(attr_name)
            return getattr(obj, attr_name, None)

        spec_id_str = get_profile_attr(profile_obj, "specialization_id")

        specialization_name = None
        if spec_id_str:
            try:
                spec_doc = self.spec_repository.get_by_id(ObjectId(spec_id_str))
                if spec_doc:
                    specialization_name = spec_doc.name
            except InvalidId:
                pass

        return {
            "_id": str(user.id),
            "email": user.email,
            "isActive": getattr(user, "is_active", True),
            "fullName": get_profile_attr(profile_obj, "fullName"),
            "phone": get_profile_attr(profile_obj, "phone"),
            "avatarUrl": get_profile_attr(profile_obj, "avatarUrl"),
            "createdAt": getattr(user, "created_at", None),
            "lastLoginAt": getattr(user, "last_login_at", None),
            "specializationName": specialization_name
        }
