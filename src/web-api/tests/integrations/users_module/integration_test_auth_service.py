import pytest
from unittest.mock import MagicMock, patch
from bson import ObjectId
from datetime import datetime, timezone

from modules.users_module.application.services.AuthService import AuthService
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.api.exception.exceptions import InvalidCredentialsException
from modules.users_module.domains.user.User import User
from modules.users_module.domains.user.UserRole import UserRole


@pytest.fixture
def auth_service():
    return AuthService(
        user_repository=MagicMock(),
        request_repository=MagicMock()
    )


# Використовуємо patch, щоб не викликати реальні алгоритми хешування під час тестів
@patch("modules.users_module.application.services.AuthService.verify_password")
@patch("modules.users_module.application.services.AuthService.create_access_token")
def test_login_success(mock_create_token, mock_verify_password, auth_service):
    """Тестуємо успішний логін"""
    # 1. Налаштовуємо моки (заглушки)
    mock_verify_password.return_value = True
    mock_create_token.return_value = ("fake-jwt-token", 1234567890)

    doc_id = ObjectId()
    mock_user = User(
        email="doctor@test.com", password="hashed", role=UserRole.DOCTOR,
        is_active=True, profile=None, created_at=datetime.now(), updated_at=datetime.now(), _id=doc_id
    )
    auth_service.user_repository.get_by_email.return_value = mock_user

    # 2. Викликаємо метод
    req = LoginRequest(email="doctor@test.com", password="correct-password")
    result = auth_service.login(req)

    # 3. Перевіряємо результати
    assert result.accessToken == "fake-jwt-token"
    assert result.userId == str(doc_id)
    assert result.role == "DOCTOR"

    # Перевіряємо, чи оновився час останнього входу
    auth_service.user_repository.update_last_login.assert_called_once()


@patch("modules.users_module.application.services.AuthService.verify_password")
def test_login_invalid_password(mock_verify_password, auth_service):
    """Тестуємо логін з неправильним паролем"""
    mock_verify_password.return_value = False  # Імітуємо неправильний пароль

    mock_user = User(
        email="patient@test.com", password="hashed", role=UserRole.PATIENT,
        is_active=True, profile=None, created_at=datetime.now(), updated_at=datetime.now()
    )
    auth_service.user_repository.get_by_email.return_value = mock_user

    req = LoginRequest(email="patient@test.com", password="wrong-password")

    # Очікуємо помилку
    with pytest.raises(InvalidCredentialsException) as exc:
        auth_service.login(req)

    assert str(exc.value) == "Wrong email or password"


def test_check_doctor_status_pending(auth_service):
    """Тест перевірки статусу лікаря, коли заявка ще розглядається"""
    # Юзера в головній таблиці ще немає
    auth_service.user_repository.get_by_email.return_value = None
    # Але є активна заявка
    auth_service.request_repository.get_pending_request_by_email_and_type.return_value = {"_id": "123"}

    result = auth_service.check_doctor_status("new_doc@test.com")

    assert result["isAuthenticated"] is False
    assert result["isPending"] is True
