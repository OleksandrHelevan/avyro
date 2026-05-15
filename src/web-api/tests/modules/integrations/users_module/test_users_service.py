import pytest
from unittest.mock import MagicMock
from bson import ObjectId
from datetime import datetime, timezone

from modules.users_module.application.services.AuthService import AuthService
from modules.users_module.application.services.PatientService import PatientService
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.api.exception.exceptions import (
    InvalidCredentialsException,
    UserNotFoundException,
    ForbiddenException
)
from modules.users_module.domains.user.User import User
from modules.users_module.domains.user.UserRole import UserRole
from modules.users_module.domains.user.Profile import Profile


@pytest.fixture
def auth_service():
    mock_user_repo = MagicMock()
    mock_request_repo = MagicMock()
    return AuthService(mock_user_repo, mock_request_repo)


def test_login_user_not_found(auth_service):
    """Якщо юзера немає в базі, сервіс має викинути InvalidCredentialsException"""
    # Налаштовуємо мок так, щоб він повертав None
    auth_service.user_repository.get_by_email.return_value = None

    req = LoginRequest(email="test@test.com", password="password")

    with pytest.raises(InvalidCredentialsException):
        auth_service.login(req)


@pytest.fixture
def patient_service():
    return PatientService(
        user_repository=MagicMock(),
        request_repository=MagicMock(),
        reward_repository=MagicMock(),
        specialization_repository=MagicMock()
    )


def test_get_patient_profile_forbidden(patient_service):
    """Якщо ми запитуємо профіль пацієнта, але юзер - лікар, має бути ForbiddenException"""
    user_id = str(ObjectId())

    # Імітуємо знайденого юзера, але з роллю DOCTOR
    mock_user = User(
        email="doctor@test.com", password="123", role=UserRole.DOCTOR,
        is_active=True, profile=None, created_at=datetime.now(), updated_at=datetime.now()
    )
    patient_service.user_repository.get_by_id.return_value = mock_user

    with pytest.raises(ForbiddenException):
        patient_service.get_patient_profile(user_id)
