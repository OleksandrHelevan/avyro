from datetime import datetime, timezone
from modules.users_module.api.exception.exceptions import InvalidCredentialsException
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.application.dto.LoginResponse import LoginResponse
from config.security import verify_password, create_access_token

from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.requests_module.infrastructure.persistence.RequestRepository import RequestRepository # Додайте імпорт

class AuthService:
    def __init__(self, user_repository: UserRepository, request_repository: RequestRepository):
        self.user_repository = user_repository
        self.request_repository = request_repository


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

    def check_doctor_status(self, email: str) -> dict:
        user = self.user_repository.get_by_email(email)
        is_authenticated = user is not None

        pending_request = self.request_repository.get_pending_request_by_email_and_type(
            email=email,
            request_type="DOCTOR_REGISTRATION"
        )
        is_pending = pending_request is not None

        return {
            "isAuthenticated": is_authenticated,
            "isPending": is_pending
        }
