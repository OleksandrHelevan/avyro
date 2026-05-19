import pytest
from unittest.mock import MagicMock
from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException

from modules.appointments_module.application.service.AppointmentService import AppointmentService
from modules.appointments_module.domains.schedule.Schedule import Schedule
from modules.appointments_module.domains.slot.Slot import Slot, SlotType


# Фікстури для моків (заглушок)
@pytest.fixture
def mock_appointment_repo():
    return MagicMock()


@pytest.fixture
def mock_schedule_repo():
    return MagicMock()


@pytest.fixture
def appointment_service(mock_appointment_repo, mock_schedule_repo):
    return AppointmentService(
        appointment_repository=mock_appointment_repo,
        schedule_repository=mock_schedule_repo
    )


def test_book_appointment_success(appointment_service, mock_schedule_repo, mock_appointment_repo):
    """Тест успішного бронювання слота"""
    slot_oid = ObjectId()
    patient_oid = ObjectId()
    doctor_oid = ObjectId()

    # 1. Імітуємо знайдений розклад із доступним слотом
    mock_slot = Slot(
        from_time=datetime.now(timezone.utc),
        to_time=datetime.now(timezone.utc),
        slot_type=SlotType.AVAILABLE,
        _id=slot_oid
    )
    mock_schedule = Schedule(
        doctor_id=doctor_oid,
        month=5, year=2026, title="Test", is_repeated=False,
        repeating={}, slots=[mock_slot],
        created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc),
        _id=ObjectId()
    )

    mock_schedule_repo.get_by_slot_id.return_value = mock_schedule

    # Імітуємо збереження Appointment в базі (повертаємо об'єкт з ID)
    mock_appointment_repo.create.side_effect = lambda x: x  # Повертає той самий об'єкт

    # 2. Викликаємо метод
    result = appointment_service.book_appointment(str(slot_oid), str(patient_oid))

    # 3. Перевіряємо результат
    assert result["patientId"] == str(patient_oid)
    assert result["doctorId"] == str(doctor_oid)
    assert result["slotId"] == str(slot_oid)

    # Перевіряємо, чи викликався метод блокування слота
    mock_schedule_repo.book_slot.assert_called_once()


def test_book_appointment_slot_blocked(appointment_service, mock_schedule_repo):
    """Тест: спроба забронювати вже зайнятий слот"""
    slot_oid = ObjectId()

    # Створюємо слот зі статусом BLOCKED
    mock_slot = Slot(
        from_time=datetime.now(), to_time=datetime.now(),
        slot_type=SlotType.BLOCKED, _id=slot_oid
    )
    mock_schedule = Schedule(
        doctor_id=ObjectId(), month=5, year=2026, title="Test",
        is_repeated=False, repeating={}, slots=[mock_slot],
        created_at=datetime.now(), updated_at=datetime.now()
    )

    mock_schedule_repo.get_by_slot_id.return_value = mock_schedule

    # Очікуємо, що сервіс викине 409 Conflict
    with pytest.raises(HTTPException) as exc_info:
        appointment_service.book_appointment(str(slot_oid), str(ObjectId()))

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == "Цей слот вже зайнятий або недоступний"
