import pytest
from unittest.mock import Mock, patch
from bson.objectid import ObjectId
from fastapi import HTTPException, status

# Замініть ці імпорти на реальні шляхи у вашому проєкті
from modules.admin_module.domains.Request import RequestType, RequestStatus
# Якщо шлях до AdminRequestService інший, оновіть його:
from modules.admin_module.application.service.AdminRequestService import AdminRequestService


# ==========================================
# ФІКСТУРИ (Налаштування моків)
# ==========================================

@pytest.fixture
def mock_request_repo():
    return Mock()


@pytest.fixture
def mock_user_service():
    return Mock()


@pytest.fixture
def mock_schedule_service():
    return Mock()


@pytest.fixture
def admin_service(mock_request_repo, mock_user_service, mock_schedule_service):
    return AdminRequestService(
        request_repo=mock_request_repo,
        user_service=mock_user_service,
        schedule_service=mock_schedule_service
    )


@pytest.fixture
def valid_request_id():
    return str(ObjectId())


@pytest.fixture
def valid_admin_id():
    return str(ObjectId())


# ==========================================
# ТЕСТИ ДЛЯ APPROVE_REGISTRATION
# ==========================================

@patch(f"{AdminRequestService.__module__}.CreateUserRequest")
def test_approve_registration_success(mock_dto_class, admin_service, mock_request_repo, mock_user_service,
                                      valid_request_id, valid_admin_id):
    # Arrange
    mock_request = Mock(
        type=RequestType.DOCTOR_REGISTRATION,
        status=RequestStatus.PENDING,
        payload={"email": "doc@mail.com"}
    )
    mock_request_repo.get_by_id.return_value = mock_request

    mock_new_user = Mock()
    mock_user_service.create_user_final.return_value = mock_new_user

    # Act
    result = admin_service.approve_registration(valid_request_id, valid_admin_id)

    # Assert
    assert result == mock_new_user
    mock_request_repo.get_by_id.assert_called_once_with(ObjectId(valid_request_id))
    mock_user_service.create_user_final.assert_called_once()
    mock_request_repo.update_status.assert_called_once_with(
        ObjectId(valid_request_id),
        RequestStatus.APPROVED,
        ObjectId(valid_admin_id)
    )


def test_approve_registration_not_found(admin_service, mock_request_repo, valid_request_id, valid_admin_id):
    # Arrange
    mock_request_repo.get_by_id.return_value = None

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        admin_service.approve_registration(valid_request_id, valid_admin_id)

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert exc_info.value.detail == "Запит на реєстрацію не знайдено"


def test_approve_registration_wrong_status(admin_service, mock_request_repo, valid_request_id, valid_admin_id):
    # Arrange
    mock_request = Mock(
        type=RequestType.DOCTOR_REGISTRATION,
        status=RequestStatus.APPROVED  # Вже погоджено
    )
    mock_request_repo.get_by_id.return_value = mock_request

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        admin_service.approve_registration(valid_request_id, valid_admin_id)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "Запит уже має статус" in exc_info.value.detail


@patch(f"{AdminRequestService.__module__}.CreateUserRequest")
def test_approve_registration_creation_error(mock_dto_class, admin_service, mock_request_repo, mock_user_service,
                                             valid_request_id, valid_admin_id):
    # Arrange
    mock_request = Mock(
        type=RequestType.DOCTOR_REGISTRATION,
        status=RequestStatus.PENDING,
        payload={}
    )
    mock_request_repo.get_by_id.return_value = mock_request
    mock_user_service.create_user_final.side_effect = Exception("DB Timeout")

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        admin_service.approve_registration(valid_request_id, valid_admin_id)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "Помилка при створенні лікаря: DB Timeout" in exc_info.value.detail


# ==========================================
# ТЕСТИ ДЛЯ APPROVE_SCHEDULE
# ==========================================

@patch(f"{AdminRequestService.__module__}.CreateScheduleDTO")
def test_approve_schedule_success(mock_dto_class, admin_service, mock_request_repo, mock_schedule_service,
                                  valid_request_id, valid_admin_id):
    # Arrange
    mock_request = Mock(
        type=RequestType.SCHEDULE_CREATION,
        status=RequestStatus.PENDING,
        payload={"doctorId": "123", "year": 2024, "month": 5}
    )
    mock_request_repo.get_by_id.return_value = mock_request

    mock_dto_instance = Mock(doctorId="123", year=2024, month=5)
    mock_dto_class.return_value = mock_dto_instance

    mock_schedule_result = Mock()
    mock_schedule_service.create_monthly_schedule.return_value = mock_schedule_result

    # Act
    result = admin_service.approve_schedule(valid_request_id, valid_admin_id)

    # Assert
    assert result == mock_schedule_result
    mock_schedule_service.create_monthly_schedule.assert_called_once_with(
        "123", 2024, 5, mock_dto_instance
    )
    mock_request_repo.update_status.assert_called_once_with(
        ObjectId(valid_request_id),
        RequestStatus.APPROVED,
        ObjectId(valid_admin_id)
    )


def test_approve_schedule_not_found(admin_service, mock_request_repo, valid_request_id, valid_admin_id):
    # Arrange
    # Імітуємо запит з неправильним типом
    mock_request = Mock(type=RequestType.DOCTOR_REGISTRATION)
    mock_request_repo.get_by_id.return_value = mock_request

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        admin_service.approve_schedule(valid_request_id, valid_admin_id)

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert exc_info.value.detail == "Запит на розклад не знайдено"


def test_approve_schedule_wrong_status(admin_service, mock_request_repo, valid_request_id, valid_admin_id):
    # Arrange
    mock_request = Mock(
        type=RequestType.SCHEDULE_CREATION,
        status=RequestStatus.REJECTED
    )
    mock_request_repo.get_by_id.return_value = mock_request

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        admin_service.approve_schedule(valid_request_id, valid_admin_id)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "Запит уже був оброблений" in exc_info.value.detail


@patch(f"{AdminRequestService.__module__}.CreateScheduleDTO")
def test_approve_schedule_creation_error(mock_dto_class, admin_service, mock_request_repo, mock_schedule_service,
                                         valid_request_id, valid_admin_id):
    # Arrange
    mock_request = Mock(
        type=RequestType.SCHEDULE_CREATION,
        status=RequestStatus.PENDING,
        payload={}
    )
    mock_request_repo.get_by_id.return_value = mock_request
    mock_schedule_service.create_monthly_schedule.side_effect = Exception("Overlap detected")

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        admin_service.approve_schedule(valid_request_id, valid_admin_id)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
    assert "Помилка при генерації розкладу: Overlap detected" in exc_info.value.detail


# ==========================================
# ТЕСТИ ДЛЯ ОТРИМАННЯ СПИСКІВ
# ==========================================

def test_get_all_registration_requests(admin_service, mock_request_repo):
    # Arrange
    mock_requests = [Mock(), Mock()]
    mock_request_repo.get_requests_by_type.return_value = mock_requests

    # Act
    result = admin_service.get_all_registration_requests()

    # Assert
    assert result == mock_requests
    mock_request_repo.get_requests_by_type.assert_called_once_with(RequestType.DOCTOR_REGISTRATION)


def test_get_all_schedule_requests(admin_service, mock_request_repo):
    # Arrange
    mock_requests = [Mock(), Mock()]
    mock_request_repo.get_requests_by_type.return_value = mock_requests

    # Act
    result = admin_service.get_all_schedule_requests()

    # Assert
    assert result == mock_requests
    mock_request_repo.get_requests_by_type.assert_called_once_with(RequestType.SCHEDULE_CREATION)
