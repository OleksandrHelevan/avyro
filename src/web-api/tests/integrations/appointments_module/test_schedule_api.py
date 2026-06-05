import pytest
from bson import ObjectId

FAKE_VALID_ID = str(ObjectId())


def test_get_doctor_schedules_empty(client):
    """
    Тест отримання розкладу лікаря.
    Оскільки розкладів у базі немає, ScheduleService.get_doctor_slots
    має повернути порожній список [].
    """
    response = client.get(f"/schedules?doctorId={FAKE_VALID_ID}")

    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) == 0


def test_get_doctor_schedules_invalid_id(client):
    """
    Перевіряємо, чи ловить сервіс невалідний формат ID лікаря.
    """
    response = client.get("/schedules?doctorId=invalid-doc-id")

    assert response.status_code == 400
    assert response.json()["detail"] == "Невалідний формат ID лікаря"


def test_request_schedule_creation(client):
    """
    Тест успішного створення запиту на розклад.
    Перевіряє роботу CreateScheduleDTO та ScheduleController.
    """
    payload = {
        "doctorId": FAKE_VALID_ID,
        "month": 5,
        "year": 2026,
        "title": "Черговий розклад Травень",
        "isRepeated": True,
        "repeating": {
            "type": "WEEKLY",
            "daysOfWeek": [0, 2, 4],  # Пн, Ср, Пт (залежно від логіки)
            "startTime": "09:00",
            "endTime": "18:00",
            "slotDuration": 30,
            "timezone": "UTC"
        }
    }

    response = client.post("/schedules/request", json=payload)

    # Контролер повертає 201 Created та dict зі статусом PENDING
    assert response.status_code == 201

    data = response.json()
    assert data["status"] == "PENDING"
    assert "requestId" in data
    assert data["message"] == "Запит на створення розкладу надіслано на розгляд адміністратору"


def test_request_schedule_validation_error(client):
    """
    Тест валідації Pydantic (CreateScheduleDTO).
    Передаємо неправильний місяць (13) та порожній payload.
    """
    payload = {
        "doctorId": FAKE_VALID_ID,
        "month": 13,  # Помилка: місяць має бути <= 12 згідно з Field(..., le=12)
        "year": 2026,
        "title": "Розклад",
        "isRepeated": False,
        "repeating": {
            "type": "DAILY",
            "startTime": "09:00",
            "endTime": "18:00",
            "slotDuration": 30
        }
    }

    response = client.post("/schedules/request", json=payload)

    # FastAPI має автоматично відхилити запит через валідацію DTO
    assert response.status_code == 422
    errors = response.json()["detail"]
    assert any("month" in err["loc"] for err in errors)
