from fastapi import HTTPException, status, Depends
from config.security import get_current_user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        # 1. Перевіряємо, чи існує користувач взагалі (якщо get_current_user чомусь не викинув 401)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token", # 401 згідно з Expected result
                headers={"WWW-Authenticate": "Bearer"},
            )

        # 2. Отримуємо роль
        user_role = user.get("role")
        if hasattr(user_role, "value"):
            user_role = user_role.value

        # 3. Перевіряємо права доступу (403 Forbidden)
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Доступ заборонено. Необхідна роль: {', '.join(self.allowed_roles)}"
            )
        return user

allow_admin = RoleChecker(["ADMIN"])
allow_doctor = RoleChecker(["DOCTOR"])
allow_patient = RoleChecker(["PATIENT"])
