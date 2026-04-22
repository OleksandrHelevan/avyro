import pytest
from unittest.mock import Mock, patch
from datetime import datetime
from modules.users_module.api.exception.exceptions import InvalidCredentialsException
from modules.users_module.application.dto.LoginRequest import LoginRequest
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.users_module.application.services.AuthService import AuthService


@pytest.fixture
def mock_user_repository():
    return Mock(spec=UserRepository)


@pytest.fixture
def auth_service(mock_user_repository):
    return AuthService(user_repository=mock_user_repository)


@patch("modules.users_module.application.services.AuthService.create_access_token")
@patch("modules.users_module.application.services.AuthService.verify_password")
def test_login_success(mock_verify_password, mock_create_access_token, auth_service, mock_user_repository):
    request = LoginRequest(email="test@example.com", password="ValidPassword123!")

    mock_user = Mock()
    mock_user.id = 123
    mock_user.password = "hashed_db_password"
    mock_user.role.value = "admin"

    mock_user_repository.get_by_email.return_value = mock_user
    mock_verify_password.return_value = True
    mock_create_access_token.return_value = ("fake-jwt-token", 3600)

    response = auth_service.login(request)

    assert response.accessToken == "fake-jwt-token"
    assert response.role == "admin"
    assert response.expiresAt == 3600
    assert response.userId == "123"

    mock_user_repository.get_by_email.assert_called_once_with("test@example.com")
    mock_verify_password.assert_called_once_with("ValidPassword123!", "hashed_db_password")
    mock_user_repository.update_last_login.assert_called_once()
    assert mock_user_repository.update_last_login.call_args[0][0] == 123


def test_login_raises_exception_when_user_not_found(auth_service, mock_user_repository):
    request = LoginRequest(email="notfound@example.com", password="AnyPassword123!")

    mock_user_repository.get_by_email.return_value = None

    with pytest.raises(InvalidCredentialsException) as exc_info:
        auth_service.login(request)

    assert str(exc_info.value) == "Wrong email or password"
    mock_user_repository.get_by_email.assert_called_once_with("notfound@example.com")
    mock_user_repository.update_last_login.assert_not_called()


@patch("modules.users_module.application.services.AuthService.verify_password")
def test_login_raises_exception_when_password_is_wrong(mock_verify_password, auth_service, mock_user_repository):
    request = LoginRequest(email="test@example.com", password="WrongPassword!")

    mock_user = Mock()
    mock_user.password = "hashed_db_password"
    mock_user_repository.get_by_email.return_value = mock_user

    mock_verify_password.return_value = False

    with pytest.raises(InvalidCredentialsException) as exc_info:
        auth_service.login(request)

    assert str(exc_info.value) == "Wrong email or password"
    mock_user_repository.get_by_email.assert_called_once_with("test@example.com")
    mock_verify_password.assert_called_once_with("WrongPassword!", "hashed_db_password")
    mock_user_repository.update_last_login.assert_not_called()
