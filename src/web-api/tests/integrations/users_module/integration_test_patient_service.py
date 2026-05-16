import pytest
from unittest.mock import MagicMock
from bson import ObjectId

from modules.users_module.application.services.PatientService import PatientService
from modules.users_module.application.dto.CreateUserRequest import CreateUserRequest
from modules.users_module.domains.user.UserRole import UserRole
from modules.users_module.api.exception.exceptions import UserAlreadyExistsException


@pytest.fixture
def patient_service():
    return PatientService(
        user_repository=MagicMock(),
        request_repository=MagicMock(),
        reward_repository=MagicMock(),
        specialization_repository=MagicMock()
    )


def test_create_user_already_exists(patient_service):
    """Тест: спроба зареєструвати email, який вже є в базі"""
    # Імітуємо, що репозиторій знайшов юзера
    patient_service.user_repository.get_by_email.return_value = {"email": "test@test.com"}

    request_dto = CreateUserRequest(
        email="test@test.com", password="123", role=UserRole.PATIENT
    )

    with pytest.raises(UserAlreadyExistsException):
        patient_service.create_user(request_dto)


def test_create_doctor_creates_request(patient_service):
    """Тест: при реєстрації лікаря створюється Request (заявка)"""
    patient_service.user_repository.get_by_email.return_value = None
    patient_service.request_repository.get_active_registration_by_email.return_value = None

    request_dto = CreateUserRequest(
        email="doc@test.com", password="123", role=UserRole.DOCTOR
    )

    result = patient_service.create_user(request_dto)

    # Має повернути повідомлення про очікування
    assert result["status"] == "Чекаємо на відповідь адміністратора"
    patient_service.request_repository.create.assert_called_once()  # Перевіряємо, чи викликався репо
