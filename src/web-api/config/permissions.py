from fastapi import HTTPException, status, Depends
from config.security import get_current_user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        user_role = user.get("role")
        if hasattr(user_role, "value"):
            user_role = user_role.value

        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ заборонено. Необхідна роль: {', '.join(self.allowed_roles)}"
            )
        return user

allow_admin = RoleChecker(["ADMIN"])
allow_doctor = RoleChecker(["DOCTOR"])
