from datetime import datetime, timezone
from modules.users_module.api.exception.exceptions import InvalidCredentialsException
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.application.dto.LoginResponse import LoginResponse
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from config.security import verify_password, create_access_token

class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def login(self, request: LoginRequest) -> LoginResponse:
        user = self.user_repository.get_by_email(request.email)

        if not user or not verify_password(request.password, user.password):
            raise InvalidCredentialsException("Wrong email or password")

        role_str = str(user.role.value) if hasattr(user.role, "value") else str(user.role)

        now = datetime.now(timezone.utc)
        self.user_repository.update_last_login(user.id, now)

        token, exp = create_access_token(
            data={
                "sub": str(user.id),
                "role": role_str
            }
        )

        return LoginResponse(
            accessToken=token,
            role=role_str,
            expiresAt=exp,
            userId=str(user.id)
        )
