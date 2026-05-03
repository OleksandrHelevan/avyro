import pytest
from unittest.mock import Mock, patch
from bson.objectid import ObjectId
from fastapi import HTTPException, status

# Замініть ці імпорти на реальні шляхи у вашому проєкті
from modules.users_module.application.services.SpecializationService import SpecializationService


@pytest.fixture
def mock_repo():
    return Mock()


@pytest.fixture
def spec_service(mock_repo):
    return SpecializationService(repository=mock_repo)


@pytest.fixture
def valid_spec_id():
    return str(ObjectId())


# ==========================================
# ТЕСТИ ДЛЯ GET_ALL_SPECIALIZATIONS
# ==========================================

def test_get_all_specializations_success(spec_service, mock_repo):
    # Arrange
    spec_1 = Mock(id=ObjectId(), description="Оперує людей")
    spec_1.name = "Хірург"  # <--- ОСЬ ТУТ ПРАВИЛЬНО ЗАДАЄМО ІМ'Я

    spec_2 = Mock(id=ObjectId(), description="Лікує людей")
    spec_2.name = "Терапевт"  # <--- І ТУТ

    mock_repo.get_all.return_value = [spec_1, spec_2]

    # Act
    result = spec_service.get_all_specializations()

    # Assert
    assert len(result) == 2
    assert result[0]["_id"] == str(spec_1.id)
    assert result[0]["name"] == "Хірург"
    assert result[0]["description"] == "Оперує людей"

    assert result[1]["_id"] == str(spec_2.id)
    assert result[1]["name"] == "Терапевт"

    mock_repo.get_all.assert_called_once()


def test_get_all_specializations_empty(spec_service, mock_repo):
    # Arrange
    mock_repo.get_all.return_value = []

    # Act
    result = spec_service.get_all_specializations()

    # Assert
    assert isinstance(result, list)
    assert len(result) == 0


# ==========================================
# ТЕСТИ ДЛЯ GET_SPECIALIZATION_BY_ID
# ==========================================

def test_get_specialization_by_id_success(spec_service, mock_repo, valid_spec_id):
    # Arrange
    mock_spec = Mock(id=ObjectId(valid_spec_id), description="Лікує серце")
    mock_spec.name = "Кардіолог"  # <--- ТУТ ТЕЖ ЗМІНЕНО
    mock_repo.get_by_id.return_value = mock_spec

    # Act
    result = spec_service.get_specialization_by_id(valid_spec_id)

    # Assert
    assert result["_id"] == valid_spec_id
    assert result["name"] == "Кардіолог"
    assert result["description"] == "Лікує серце"

    mock_repo.get_by_id.assert_called_once_with(ObjectId(valid_spec_id))


def test_get_specialization_by_id_invalid_id(spec_service):
    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        spec_service.get_specialization_by_id("not-a-valid-object-id")

    assert exc_info.value.status_code == status.HTTP_400_BAD_REQUEST
    assert exc_info.value.detail == "Невалідний формат ID спеціалізації"


def test_get_specialization_by_id_not_found(spec_service, mock_repo, valid_spec_id):
    # Arrange
    mock_repo.get_by_id.return_value = None

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        spec_service.get_specialization_by_id(valid_spec_id)

    assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
    assert exc_info.value.detail == "Спеціалізацію не знайдено"


# ==========================================
# ТЕСТИ ДЛЯ CREATE_SPECIALIZATION
# ==========================================

@patch("modules.users_module.application.services.SpecializationService.Specialization")
def test_create_specialization_success(mock_specialization_class, spec_service, mock_repo):
    # Arrange
    request_dto = Mock()
    request_dto.name = "Педіатр"
    request_dto.description = "Дитячий лікар"

    mock_spec_instance = Mock(description="Дитячий лікар")
    mock_spec_instance.name = "Педіатр"  # <--- ТУТ ТЕЖ ЗМІНЕНО
    mock_specialization_class.return_value = mock_spec_instance

    created_id = ObjectId()
    mock_created_spec = Mock(id=created_id, description="Дитячий лікар")
    mock_created_spec.name = "Педіатр"  # <--- І ТУТ ТЕЖ
    mock_repo.create.return_value = mock_created_spec

    # Act
    result = spec_service.create_specialization(request_dto)

    # Assert
    assert result["_id"] == str(created_id)
    assert result["name"] == "Педіатр"
    assert result["description"] == "Дитячий лікар"

    mock_specialization_class.assert_called_once_with(name="Педіатр", description="Дитячий лікар")
    mock_repo.create.assert_called_once_with(mock_spec_instance)
