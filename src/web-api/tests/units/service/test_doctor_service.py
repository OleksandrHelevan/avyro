import pytest
from unittest.mock import Mock, MagicMock, patch
from bson.objectid import ObjectId
from fastapi import HTTPException, status

# Імпортуйте ваш DoctorService та DTO з правильних шляхів вашого проєкту
from modules.users_module.application.services.DoctorService import DoctorService


@pytest.fixture
def mock_user_repo():
    return Mock()


@pytest.fixture
def mock_spec_repo():
    return Mock()


# ДОДАНО: Фікстура для репозиторію розкладів
@pytest.fixture
def mock_schedule_repo():
    repo = Mock()
    # За замовчуванням повертаємо порожній список розкладів, щоб не ламати інші тести
    repo.get_all_by_doctor_id.return_value = []
    return repo


# ВИПРАВЛЕНО: Додано mock_schedule_repo у сервіс
@pytest.fixture
def doctor_service(mock_user_repo, mock_spec_repo, mock_schedule_repo):
    return DoctorService(
        user_repository=mock_user_repo,
        spec_repository=mock_spec_repo,
        schedule_repository=mock_schedule_repo
    )


@pytest.fixture
def valid_user_id():
    return str(ObjectId())


@pytest.fixture
def valid_spec_id():
    return str(ObjectId())


@pytest.fixture
def mock_profile_request(valid_spec_id):
    # Імітуємо DTO DoctorProfileUpdateRequest
    request = Mock()
    request.specialization_id = valid_spec_id
    request.fullName = "Dr. Gregory House"
    request.phone = "+380991234567"
    request.avatarUrl = "http://example.com/avatar.jpg"
    return request


# ==========================================
# ТЕСТИ ДЛЯ PATCH_DOCTOR_PROFILE
# ==========================================

def test_patch_doctor_profile_success(doctor_service, mock_user_repo, mock_spec_repo, valid_user_id,
                                      mock_profile_request):
    # Arrange
    user_oid = ObjectId(valid_user_id)

    mock_spec_repo.get_by_id.return_value = Mock(id=ObjectId(mock_profile_request.specialization_id), name="Терапевт")

    # Імітуємо користувача до оновлення
    initial_user = Mock(id=user_oid, role="DOCTOR", email="house@gmail.com", is_active=True)
    initial_user.profile = None

    # Імітуємо користувача після оновлення
    updated_user = Mock(id=user_oid, role="DOCTOR", email="house@gmail.com", is_active=True, created_at="2023-01-01",
                        last_login_at="2023-01-02")

    # Створюємо надійний об'єкт-заглушку для профілю
    class FakeProfile:
        pass

    profile_mock = FakeProfile()
    profile_mock.fullName = "Dr. Gregory House"
    profile_mock.phone = "+380991234567"
    profile_mock.avatarUrl = "http://example.com/avatar.jpg"
    profile_mock.specialization_id = mock_profile_request.specialization_id

    updated_user.profile = profile_mock

    # get_by_id викликається двічі: до оновлення і після
    mock_user_repo.get_by_id.side_effect = [initial_user, updated_user]

    # Act
    result = doctor_service.patch_doctor_profile(valid_user_id, mock_profile_request)

    # Assert
    assert result["_id"] == valid_user_id
    assert result["email"] == "house@gmail.com"
    assert result["fullName"] == "Dr. Gregory House"
    assert result["phone"] == "+380991234567"
    assert result["avatarUrl"] == "http://example.com/avatar.jpg"
    assert "schedule" in result  # Перевіряємо, що поле розкладу теж є

    mock_user_repo.update_profile.assert_called_once()
    args, kwargs = mock_user_repo.update_profile.call_args
    assert args[0] == user_oid
    assert args[1]["specialization_id"] == ObjectId(mock_profile_request.specialization_id)


def test_patch_doctor_profile_invalid_id(doctor_service, mock_profile_request):
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        doctor_service.patch_doctor_profile("invalid-id", mock_profile_request)
    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST


def test_patch_doctor_profile_spec_not_found(doctor_service, mock_spec_repo, mock_user_repo, valid_user_id,
                                             mock_profile_request):
    # Arrange
    mock_spec_repo.get_by_id.return_value = None

    # ДОДАЄМО ПРАВИЛЬНОГО ЮЗЕРА, щоб пройти першу перевірку:
    mock_user_repo.get_by_id.return_value = Mock(role="DOCTOR")

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        doctor_service.patch_doctor_profile(valid_user_id, mock_profile_request)
    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert "Спеціалізацію не знайдено" in exc_info.value.detail


def test_patch_doctor_profile_user_not_found(doctor_service, mock_user_repo, mock_spec_repo, valid_user_id,
                                             mock_profile_request):
    # Arrange
    mock_spec_repo.get_by_id.return_value = Mock()
    mock_user_repo.get_by_id.return_value = None

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        doctor_service.patch_doctor_profile(valid_user_id, mock_profile_request)
    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert exc_info.value.detail == "Користувача не знайдено"


def test_patch_doctor_profile_not_a_doctor(doctor_service, mock_user_repo, mock_spec_repo, valid_user_id,
                                           mock_profile_request):
    # Arrange
    user_not_doctor = Mock()
    user_not_doctor.role = "PATIENT"
    user_not_doctor.profile = None
    mock_user_repo.get_by_id.return_value = user_not_doctor

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        doctor_service.patch_doctor_profile(valid_user_id, mock_profile_request)
    assert exc_info.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc_info.value.detail == "Користувач не є лікарем"


# ==========================================
# ТЕСТИ ДЛЯ GET_DOCTOR_BY_ID
# ==========================================

def test_get_doctor_by_id_success(doctor_service, mock_user_repo, mock_spec_repo, mock_schedule_repo, valid_user_id,
                                  valid_spec_id):
    # Arrange
    mock_user = Mock(id=ObjectId(valid_user_id), role="DOCTOR", email="doc@mail.com", is_active=True)
    mock_user.profile = {
        "fullName": "Dr. Smith",
        "phone": "111",
        "avatarUrl": "img.png",
        "specialization_id": valid_spec_id
    }
    mock_user.created_at = "2023-01-01"
    mock_user.last_login_at = "2023-01-02"

    mock_user_repo.get_by_id.return_value = mock_user
    mock_spec = Mock()
    mock_spec.name = "Хірург"
    mock_spec_repo.get_by_id.return_value = mock_spec

    # ДОДАНО: Імітуємо повернення розкладу з БД
    fake_schedule_id = ObjectId()
    fake_slot_id = ObjectId()
    mock_schedule_repo.get_by_doctor_id.return_value = [
        {
            "_id": fake_schedule_id,
            "doctorId": ObjectId(valid_user_id),
            "month": 5,
            "year": 2026,
            "status": "APPROVED",
            "slots": [
                {
                    "slotId": fake_slot_id,
                    "from": "09:00",
                    "to": "10:00",
                    "type": "AVAILABLE"
                }
            ]
        }
    ]

    # Act
    result = doctor_service.get_doctor_by_id(valid_user_id)

    # Assert
    assert result["_id"] == valid_user_id
    assert result["email"] == "doc@mail.com"
    assert result["fullName"] == "Dr. Smith"
    assert result["specializationName"] == "Хірург"

    # ДОДАНО: Перевіряємо форматування розкладу
    assert len(result["schedule"]) == 1
    assert result["schedule"][0]["id"] == str(fake_schedule_id)
    assert result["schedule"][0]["status"] == "APPROVED"
    assert result["schedule"][0]["slots"][0]["slotId"] == str(fake_slot_id)


def test_get_doctor_by_id_invalid_id(doctor_service):
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        doctor_service.get_doctor_by_id("bad-id")
    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST


def test_get_doctor_by_id_user_not_found(doctor_service, mock_user_repo, valid_user_id):
    # Arrange
    mock_user_repo.get_by_id.return_value = None

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        doctor_service.get_doctor_by_id(valid_user_id)
    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND


def test_get_doctor_by_id_not_a_doctor(doctor_service, mock_user_repo, valid_user_id):
    # Arrange
    mock_user_repo.get_by_id.return_value = Mock(role="ADMIN", profile=None)

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        doctor_service.get_doctor_by_id(valid_user_id)

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
    assert exc_info.value.detail == "Користувач не є лікарем"


def test_get_doctor_by_id_no_specialization(doctor_service, mock_user_repo, mock_spec_repo, valid_user_id):
    # Arrange
    mock_user = Mock(id=ObjectId(valid_user_id), role="DOCTOR", email="doc@mail.com", is_active=True)
    # Профіль без спеціалізації
    mock_user.profile = {"fullName": "Dr. Smith"}

    mock_user_repo.get_by_id.return_value = mock_user

    # Act
    result = doctor_service.get_doctor_by_id(valid_user_id)

    # Assert
    assert result["specializationName"] is None
    assert result["schedule"] == []
    mock_spec_repo.get_by_id.assert_not_called()
