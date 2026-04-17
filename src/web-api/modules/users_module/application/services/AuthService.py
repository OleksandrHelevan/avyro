from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.application.dto.LoginResponse import LoginResponse
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from config.security import verify_password, create_access_token


class InvalidCredentialsException(Exception):
    pass


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def login(self, request: LoginRequest) -> LoginResponse:
        user = self.user_repository.get_by_email(request.email)

        if not user or not verify_password(request.password, user.password):
            raise InvalidCredentialsException("Невірний email або пароль")
        role_str = str(user.role.value) if hasattr(user.role, 'value') else str(user.role)

        token, exp = create_access_token(
            data={
                "sub": str(user.id),
                "role": role_str
            }
        )

        return LoginResponse(
            accessToken=token,
            role=role_str,
            expiresAt=exp
        )
