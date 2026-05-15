import pytest
from unittest.mock import MagicMock
from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException

from modules.appointments_module.application.service.ScheduleService import ScheduleService
from modules.appointments_module.application.dto.CreateScheduleDTO import CreateScheduleDTO
from modules.appointments_module.domains.schedule.Schedule import Schedule
from modules.appointments_module.domains.slot.Slot import Slot, SlotType


@pytest.fixture
def schedule_service():
    return ScheduleService(
        repository=MagicMock(),
        slot_service=MagicMock(),
        request_repository=MagicMock()
    )


def test_get_doctor_slots(schedule_service):
    """Перевіряємо, чи правильно сервіс розгортає масив слотів із розкладів"""
    doc_id = ObjectId()

    mock_slot = Slot(from_time=datetime.now(timezone.utc), to_time=datetime.now(timezone.utc),
                     slot_type=SlotType.AVAILABLE, _id=ObjectId())
    mock_schedule = Schedule(
        doctor_id=doc_id, month=5, year=2026, title="Травень", is_repeated=False,
        repeating={}, slots=[mock_slot], created_at=datetime.now(), updated_at=datetime.now()
    )

    schedule_service.repository.get_all_by_doctor_id.return_value = [mock_schedule]

    slots = schedule_service.get_doctor_slots(str(doc_id))

    assert len(slots) == 1
    assert slots[0]["slotId"] == str(mock_slot.id)
    assert slots[0]["type"] == "AVAILABLE"


def test_request_schedule_creation(schedule_service):
    """Тестуємо створення заявки на розклад"""
    doc_id = str(ObjectId())
    dto = CreateScheduleDTO(
        doctorId=doc_id, month=5, year=2026, title="Test", isRepeated=False,
        repeating={"type": "WEEKLY", "startTime": "09:00", "endTime": "18:00", "slotDuration": 30}
    )

    # Імітуємо збереження Request
    mock_request = MagicMock()
    mock_request.id = ObjectId()
    schedule_service.request_repository.create.return_value = mock_request

    result_id = schedule_service.request_schedule_creation(dto)

    assert result_id == str(mock_request.id)
    schedule_service.request_repository.create.assert_called_once()
