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
    def __init__(
        self,
        user_repository: UserRepository,
        spec_repository: SpecializationRepository,
        schedule_repository
    ):
        self.user_repository = user_repository
        self.spec_repository = spec_repository
        self.schedule_repository = schedule_repository

    def patch_doctor_profile(self, user_id: str, profile_data: DoctorProfileUpdateRequest) -> dict:
        try:
            user_oid = ObjectId(user_id)
            spec_oid = ObjectId(profile_data.specialization_id)
        except (InvalidId, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID")

        # 1. Спочатку дістаємо юзера і перевіряємо його
        user = self.user_repository.get_by_id(user_oid)
        if not user:
            raise HTTPException(status_code=404, detail="Користувача не знайдено")

        if str(user.role) != "DOCTOR" and str(user.role) != "Role.DOCTOR":
            raise HTTPException(status_code=403, detail="Користувач не є лікарем")

        # 2. Потім дістаємо спеціалізацію
        specialization = self.spec_repository.get_by_id(spec_oid)
        if not specialization:
            raise HTTPException(status_code=404, detail="Спеціалізацію не знайдено")

        profile_update = {
            "fullName": profile_data.fullName,
            "phone": profile_data.phone,
            "avatarUrl": profile_data.avatarUrl,
            "specialization_id": spec_oid
        }

        self.user_repository.update_profile(user_oid, profile_update)

        return self.get_doctor_by_id(user_id)

    def get_doctor_by_id(self, user_id: str) -> dict:
        try:
            user_oid = ObjectId(user_id)
        except (InvalidId, TypeError):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Невалідний формат ID")

        user = self.user_repository.get_by_id(user_oid)
        if not user:
            raise HTTPException(status_code=404, detail="Користувача не знайдено")

        if str(user.role) != "DOCTOR" and str(user.role) != "Role.DOCTOR":
            raise HTTPException(status_code=400, detail="Користувач не є лікарем")

        profile_obj = getattr(user, "profile", None)

        def get_attr(obj, attr_name, default=None):
            if not obj: return default
            if isinstance(obj, dict): return obj.get(attr_name, default)
            return getattr(obj, attr_name, default)

        spec_id_raw = get_attr(profile_obj, "specialization_id") or get_attr(profile_obj, "specializationId")

        specialization_name = None
        spec_id_str = str(spec_id_raw) if spec_id_raw else None

        if spec_id_raw:
            try:
                search_oid = spec_id_raw if isinstance(spec_id_raw, ObjectId) else ObjectId(spec_id_str)
                spec_doc = self.spec_repository.get_by_id(search_oid)

                if spec_doc:
                    specialization_name = getattr(spec_doc, "name", None)
            except Exception as e:
                logger.error(f"Error fetching specialization name: {e}")

        formatted_schedules = []
        try:
            raw_schedules = self.schedule_repository.get_all_by_doctor_id(user_oid)

            for sched in raw_schedules:
                formatted_slots = []
                for slot in sched.get("slots", []):
                    app_id = slot.get("appointmentId")
                    formatted_slots.append({
                        "slotId": str(slot.get("slotId", slot.get("_id", ""))),
                        "from": slot.get("from"),
                        "to": slot.get("to"),
                        "type": slot.get("type"),
                        "appointmentId": str(app_id) if app_id else None
                    })

                # Обробка самого розкладу
                formatted_schedules.append({
                    "id": str(sched.get("_id")),
                    "doctorId": str(sched.get("doctorId")),
                    "month": sched.get("month"),
                    "year": sched.get("year"),
                    "title": sched.get("title", ""),
                    "isRepeated": sched.get("isRepeated", False),
                    "repeating": sched.get("repeating", {}),
                    "status": sched.get("status", "PENDING"),
                    "slots": formatted_slots,
                    "createdAt": sched.get("createdAt"),
                    "updatedAt": sched.get("updatedAt")
                })
        except Exception as e:
            logger.error(f"Error fetching schedule for doctor {user_id}: {e}")


        return {
            "_id": str(user.id),
            "email": user.email,
            "isActive": getattr(user, "is_active", True),
            "fullName": get_attr(profile_obj, "fullName") or get_attr(profile_obj, "full_name"),
            "phone": get_attr(profile_obj, "phone"),
            "avatarUrl": get_attr(profile_obj, "avatarUrl") or get_attr(profile_obj, "avatar_url"),
            "specializationId": spec_id_str,
            "specializationName": specialization_name,
            "createdAt": getattr(user, "created_at", None),
            "lastLoginAt": getattr(user, "last_login_at", None),
            "schedule": formatted_schedules
        }
