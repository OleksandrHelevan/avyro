import pytest
from datetime import datetime, timezone, timedelta

# Замініть імпорти на реальні шляхи у вашому проєкті
from modules.appointments_module.application.service.SlotService import SlotService
from modules.appointments_module.domains.slot.Slot import SlotType


@pytest.fixture
def slot_service():
    return SlotService()


@pytest.fixture
def base_config():
    return {
        "daysOfWeek": [0, 2, 4],  # Понеділок, Середа, П'ятниця
        "startTime": "09:00",
        "endTime": "11:00",
        "slotDuration": 30
    }


# ==========================================
# ТЕСТИ ДЛЯ SLOT_SERVICE
# ==========================================

def test_generate_monthly_slots_success(slot_service, base_config):
    # Arrange
    doctor_id = "doc_123"
    year = 2024
    month = 5  # Травень 2024

    # У травні 2024 року:
    # Понеділків (0): 6, 13, 20, 27 (4 дні)
    # Серед (2): 1, 8, 15, 22, 29 (5 днів)
    # П'ятниць (4): 3, 10, 17, 24, 31 (5 днів)
    # Загалом робочих днів: 14.
    # Робочий час: 09:00 - 11:00 (2 години) = 4 слоти по 30 хв на день.
    # Загальна кількість слотів: 14 * 4 = 56.

    # Act
    slots = slot_service.generate_monthly_slots(doctor_id, year, month, base_config)

    # Assert
    assert len(slots) == 56

    # Перевіримо перший слот (1 травня 2024, Середа)
    first_slot = slots[0]
    expected_start = datetime(2024, 5, 1, 9, 0, tzinfo=timezone.utc)
    expected_end = datetime(2024, 5, 1, 9, 30, tzinfo=timezone.utc)

    assert first_slot.from_time == expected_start
    assert first_slot.to_time == expected_end
    assert first_slot.slot_type == SlotType.AVAILABLE


def test_generate_monthly_slots_empty_days(slot_service, base_config):
    # Arrange
    base_config["daysOfWeek"] = []  # Немає робочих днів

    # Act
    slots = slot_service.generate_monthly_slots("doc_123", 2024, 5, base_config)

    # Assert
    assert isinstance(slots, list)
    assert len(slots) == 0


def test_generate_monthly_slots_duration_longer_than_work_time(slot_service, base_config):
    # Arrange
    base_config["startTime"] = "09:00"
    base_config["endTime"] = "09:15"
    base_config["slotDuration"] = 30  # Слот довший за загальний робочий час

    # Act
    slots = slot_service.generate_monthly_slots("doc_123", 2024, 5, base_config)

    # Assert
    assert len(slots) == 0  # Жоден слот не має поміститися


def test_generate_monthly_slots_remainder_time(slot_service, base_config):
    # Arrange
    base_config["daysOfWeek"] = [0]  # Тільки понеділки (4 дні у травні 2024)
    base_config["startTime"] = "09:00"
    base_config["endTime"] = "10:00"
    base_config["slotDuration"] = 40  # Слот 40 хвилин (один поміститься, 20 хв залишиться)

    # Act
    slots = slot_service.generate_monthly_slots("doc_123", 2024, 5, base_config)

    # Assert
    # 4 дні * 1 слот на день = 4 слоти
    assert len(slots) == 4

    # Перевіряємо, що слот дійсно на 40 хвилин і не виходить за межі endTime
    first_slot = slots[0]
    expected_start = datetime(2024, 5, 6, 9, 0, tzinfo=timezone.utc)
    expected_end = datetime(2024, 5, 6, 9, 40, tzinfo=timezone.utc)

    assert first_slot.from_time == expected_start
    assert first_slot.to_time == expected_end


def test_generate_monthly_slots_crosses_midnight(slot_service, base_config):
    # Якщо за якихось обставин робочий час вказано неправильно (наприклад кінець раніше початку)
    # Arrange
    base_config["startTime"] = "18:00"
    base_config["endTime"] = "10:00"  # Кінець менший за початок

    # Act
    slots = slot_service.generate_monthly_slots("doc_123", 2024, 5, base_config)

    # Assert
    # Цикл while slot_time + duration <= work_end одразу не виконається
    assert len(slots) == 0
