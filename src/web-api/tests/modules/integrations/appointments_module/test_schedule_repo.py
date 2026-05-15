import pytest
import mongomock
from bson import ObjectId
from datetime import datetime, timezone

from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository
from modules.appointments_module.domains.schedule.Schedule import Schedule, ScheduleStatus
from modules.appointments_module.domains.slot.Slot import Slot, SlotType


@pytest.fixture
def schedule_repo():
    client = mongomock.MongoClient()
    return ScheduleRepository(client.test_db.schedules)


def test_create_and_get_schedule(schedule_repo):
    """Тестуємо створення розкладу та отримання за ID і місяцем"""
    doc_id = ObjectId()

    # Створюємо розклад з одним слотом
    slot = Slot(from_time=datetime.now(timezone.utc), to_time=datetime.now(timezone.utc), slot_type=SlotType.AVAILABLE)
    schedule = Schedule(
        doctor_id=doc_id, month=5, year=2026, title="Травень", is_repeated=False,
        repeating={}, slots=[slot], status=ScheduleStatus.APPROVED,
        created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc)
    )

    created = schedule_repo.create(schedule)
    assert created.id is not None

    # Перевіряємо пошук за місяцем
    found_by_month = schedule_repo.get_by_month(doc_id, 2026, 5)
    assert found_by_month is not None
    assert found_by_month.title == "Травень"


def test_book_slot_atomic_update(schedule_repo):
    """Тестуємо атомарне бронювання слота (зміна статусу всередині масиву)"""
    doc_id = ObjectId()
    slot_id = ObjectId()
    app_id = ObjectId()

    slot = Slot(from_time=datetime.now(timezone.utc), to_time=datetime.now(timezone.utc), slot_type=SlotType.AVAILABLE,
                _id=slot_id)
    schedule = Schedule(
        doctor_id=doc_id, month=5, year=2026, title="Травень", is_repeated=False,
        repeating={}, slots=[slot], created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc)
    )
    created = schedule_repo.create(schedule)

    # Викликаємо метод бронювання
    success = schedule_repo.book_slot(created.id, str(slot_id), str(app_id))
    assert success is True

    # Перевіряємо, чи змінився слот у базі
    updated_schedule = schedule_repo.get_by_id(created.id)
    updated_slot = next(s for s in updated_schedule.slots if str(s.id) == str(slot_id))
    assert updated_slot.slot_type == SlotType.BLOCKED
    assert str(updated_slot.appointment_id) == str(app_id)
