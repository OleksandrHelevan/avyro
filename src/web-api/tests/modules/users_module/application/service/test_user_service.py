import pytest
from unittest.mock import Mock, patch
from bson import ObjectId

from modules.users_module.api.exception.exceptions import (
    ForbiddenException,
    InvalidUserIdException,
    UserAlreadyExistsException
)
from modules.users_module.domains.user.Profile import Profile
from modules.users_module.domains.user.UserRole import UserRole
from modules.users_module.application.services.PatientService import PatientService


@pytest.fixture
def mock_user_repository():
    return Mock()


@pytest.fixture
def mock_request_repository():
    return Mock()


@pytest.fixture
def user_service(mock_user_repository, mock_request_repository):
    # Додано обов'язковий request_repository
    return PatientService(
        user_repository=mock_user_repository,
        request_repository=mock_request_repository
    )


def test_to_object_id_success(user_service):
    valid_id = str(ObjectId())
    result = user_service._to_object_id(valid_id)
    assert isinstance(result, ObjectId)
    assert str(result) == valid_id


def test_to_object_id_invalid(user_service):
    with pytest.raises(InvalidUserIdException) as exc_info:
        user_service._to_object_id("invalid-mongo-id")
    assert str(exc_info.value) == "Invalid user id"


@patch("modules.users_module.application.services.PatientService.UserMapper")
@patch("modules.users_module.application.services.PatientService.hash_password")
def test_create_user_success_with_profile(mock_hash_password, mock_user_mapper, user_service, mock_user_repository,
                                          mock_request_repository):
    request = Mock()
    request.email = "newuser@example.com"
    request.password = "SecurePass123!"
    request.role = UserRole.PATIENT
    request.isActive = True
    request.profile.fullName = "John Doe"
    request.profile.phone = "+380501234567"
    request.profile.specializationId = None
    request.profile.avatarUrl = "http://example.com/avatar.png"

    mock_user_repository.get_by_email.return_value = None
    mock_request_repository.get_active_registration_by_email.return_value = None

    mock_hash_password.return_value = "hashed_password"
    saved_user_mock = Mock()
    mock_user_repository.create.return_value = saved_user_mock
    mock_user_mapper.to_user_response.return_value = "UserCreatedResponse"

    response = user_service.create_user(request)

    assert response == "UserCreatedResponse"
    mock_user_repository.create.assert_called_once()


def test_create_doctor_registration_request(user_service, mock_user_repository, mock_request_repository):
    request = Mock()
    request.email = "doctor@example.com"
    request.role = UserRole.DOCTOR
    request.dict.return_value = {"email": "doctor@example.com"}
    mock_user_repository.get_by_email.return_value = None
    mock_request_repository.get_active_registration_by_email.return_value = None

    response = user_service.create_user(request)

    assert response == {"status": "Чекаємо на відповідь адміністратора"}
    mock_request_repository.create.assert_called_once()


def test_create_user_raises_exception_if_exists(user_service, mock_user_repository, mock_request_repository):
    request = Mock()
    request.email = "existing@example.com"

    mock_user_repository.get_by_email.return_value = Mock()
    mock_request_repository.get_active_registration_by_email.return_value = None

    with pytest.raises(UserAlreadyExistsException) as exc_info:
        user_service.create_user(request)

    assert str(exc_info.value) == "Email already exists in our system"


@patch("modules.users_module.application.services.PatientService.UserMapper")
def test_get_patient_profile_success(mock_user_mapper, user_service, mock_user_repository):
    user_id = str(ObjectId())

    mock_user = Mock()
    mock_user_repository.get_by_id.return_value = mock_user
    mock_user_mapper.normalize_role.return_value = "PATIENT"
    mock_user_mapper.to_patient_response.return_value = "PatientProfileData"

    response = user_service.get_patient_profile(user_id)

    assert response == "PatientProfileData"
    mock_user_repository.get_by_id.assert_called_once()


@patch("modules.users_module.application.services.PatientService.UserMapper")
def test_get_patient_profile_forbidden_for_non_patient(mock_user_mapper, user_service, mock_user_repository):
    user_id = str(ObjectId())
    mock_user_repository.get_by_id.return_value = Mock()

    mock_user_mapper.normalize_role.return_value = "DOCTOR"

    with pytest.raises(ForbiddenException) as exc_info:
        user_service.get_patient_profile(user_id)

    assert str(exc_info.value) == "Not a patient"


@patch("modules.users_module.application.services.PatientService.UserMapper")
def test_patch_patient_profile_success(mock_user_mapper, user_service, mock_user_repository):
    user_id = str(ObjectId())

    request = Mock()
    request.fullName = "Updated Name"
    request.phone = "111222333"
    request.avatarUrl = "http://new.com/img.png"

    mock_user = Mock()
    mock_user.profile = Profile(full_name="Old Name")

    mock_user_repository.get_by_id.side_effect = [mock_user, mock_user]
    mock_user_mapper.normalize_role.return_value = "PATIENT"
    mock_user_mapper.to_patient_response.return_value = "UpdatedProfile"

    response = user_service.patch_patient_profile(user_id, request)

    assert response == "UpdatedProfile"
    assert mock_user.profile.full_name == "Updated Name"
    mock_user_repository.update_profile.assert_called_once()
