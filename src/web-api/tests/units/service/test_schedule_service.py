import pytest
from unittest.mock import Mock, MagicMock, patch
from bson.objectid import ObjectId

from modules.appointments_module.application.service.ScheduleService import ScheduleService


@pytest.fixture
def mock_schedule_repo():
    return Mock()


@pytest.fixture
def mock_slot_service():
    return Mock()


@pytest.fixture
def mock_request_repo():
    return Mock()


@pytest.fixture
def schedule_service(mock_schedule_repo, mock_slot_service, mock_request_repo):
    return ScheduleService(
        repository=mock_schedule_repo,
        slot_service=mock_slot_service,
        request_repository=mock_request_repo
    )


@pytest.fixture
def valid_doctor_id():
    return str(ObjectId())


@pytest.fixture
def mock_schedule_dto(valid_doctor_id):
    dto = MagicMock()
    dto.doctorId = valid_doctor_id
    dto.month = 10
    dto.year = 2024
    dto.title = "Жовтень 2024"
    dto.isRepeated = True

    # Мокаємо новий метод model_dump() для repeating конфігу
    dto.repeating.model_dump.return_value = {"daysOfWeek": [1, 3], "startTime": "09:00", "endTime": "18:00"}

    # Мокаємо новий метод model_dump() для самого DTO
    dto.model_dump.return_value = {
        "doctorId": valid_doctor_id,
        "month": 10,
        "year": 2024,
        "title": "Жовтень 2024"
    }
    return dto


@patch.object(ScheduleService, 'create_monthly_schedule')
def test_create_schedule(mock_create_monthly, schedule_service, mock_schedule_dto):
    # Arrange
    expected_result = {"status": "created"}
    mock_create_monthly.return_value = expected_result

    # Act
    result = schedule_service.create_schedule(mock_schedule_dto)

    # Assert
    assert result == expected_result
    # Перевіряємо, чи був викликаний внутрішній метод з правильними аргументами
    mock_create_monthly.assert_called_once_with(
        mock_schedule_dto.doctorId,
        mock_schedule_dto.year,
        mock_schedule_dto.month,
        mock_schedule_dto
    )



# Мокаємо клас Request там, де він імпортується у ScheduleService
@patch("modules.appointments_module.application.service.ScheduleService.Request")
def test_request_schedule_creation(mock_request_class, schedule_service, mock_request_repo, mock_schedule_dto):
    # Arrange
    # Імітуємо створений доменний об'єкт Request
    mock_request_instance = MagicMock()
    mock_request_class.return_value = mock_request_instance

    # Імітуємо збережений об'єкт, який повертає репозиторій
    saved_request_id = ObjectId()
    mock_saved_request = MagicMock()
    mock_saved_request.id = saved_request_id
    mock_request_repo.create.return_value = mock_saved_request

    # Act
    result = schedule_service.request_schedule_creation(mock_schedule_dto)

    # Assert
    assert result == str(saved_request_id)

    # Перевіряємо створення Request з правильними параметрами
    mock_request_class.assert_called_once()
    _, kwargs = mock_request_class.call_args
    assert kwargs['creator_id'] == ObjectId(mock_schedule_dto.doctorId)
    assert kwargs['type'].name == "SCHEDULE_CREATION"
    assert kwargs['payload']['doctorId'] == mock_schedule_dto.doctorId
    # Перевіряємо виклик репозиторію
    mock_request_repo.create.assert_called_once_with(mock_request_instance)


@patch("modules.appointments_module.application.service.ScheduleService.Schedule")
@patch("modules.appointments_module.application.service.ScheduleService.ScheduleMapper")
def test_create_monthly_schedule(
    mock_mapper_class, mock_schedule_class, schedule_service,
    mock_schedule_repo, mock_slot_service, mock_schedule_dto, valid_doctor_id
):
    # Arrange
    year = 2024
    month = 10

    # 1. Мокаємо повернення слотів від SlotService
    mock_slots = [MagicMock(), MagicMock()]
    mock_slot_service.generate_monthly_slots.return_value = mock_slots

    # 2. Мокаємо створення об'єкта Schedule
    mock_schedule_instance = MagicMock()
    mock_schedule_class.return_value = mock_schedule_instance

    # 3. Мокаємо збереження у БД
    mock_created_schedule = MagicMock()
    mock_schedule_repo.create.return_value = mock_created_schedule

    # 4. Мокаємо ScheduleMapper
    mapped_dto = {"id": "123", "month": 10}
    mock_mapper_class.to_dto.return_value = mapped_dto

    # Act
    result = schedule_service.create_monthly_schedule(valid_doctor_id, year, month, mock_schedule_dto)

    # Assert
    assert result == mapped_dto

    mock_slot_service.generate_monthly_slots.assert_called_once_with(
        doctor_id=valid_doctor_id,
        year=year,
        month=month,
        config=mock_schedule_dto.repeating.model_dump()
    )

    mock_schedule_class.assert_called_once()
    call_kwargs = mock_schedule_class.call_args[1]
    assert call_kwargs["doctor_id"] == ObjectId(valid_doctor_id)
    assert call_kwargs["month"] == month
    assert call_kwargs["year"] == year
    assert call_kwargs["title"] == mock_schedule_dto.title
    assert call_kwargs["slots"] == mock_slots

    mock_schedule_repo.create.assert_called_once_with(mock_schedule_instance)
    mock_mapper_class.to_dto.assert_called_once_with(mock_created_schedule)
