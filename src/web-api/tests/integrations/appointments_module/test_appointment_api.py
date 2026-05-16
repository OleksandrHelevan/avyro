import pytest
from bson import ObjectId

# Генеруємо фейковий, але валідний ObjectId для MongoDB
FAKE_VALID_ID = str(ObjectId())
INVALID_ID = "invalid-id-format"


def test_book_appointment_not_found(client):
    """
    Тест бронювання слота.
    Оскільки база порожня, сервіс AppointmentService.book_appointment
    не знайде розклад і має повернути 404 'Слот не знайдено'.
    """
    payload = {
        "doctorId": FAKE_VALID_ID,  # <- Додано
        "slotId": FAKE_VALID_ID
    }
    response = client.post("/appointments", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "Розклад для цього лікаря не знайдено"


def test_book_appointment_invalid_id(client):
    """
    Тест перевірки валідації ObjectId у сервісі.
    Має повернути 400 'Невалідний формат ID'.
    """
    payload = {
        "doctorId": FAKE_VALID_ID,  # <- Додано (можна використати FAKE_VALID_ID, якщо тестуєш саме невалідний slotId)
        "slotId": INVALID_ID
    }
    response = client.post("/appointments", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "Невалідний формат ID"


def test_get_appointment_not_found(client):
    """
    Тест отримання запису за ID.
    Запис не існує в базі, тому очікуємо 404.
    """
    response = client.get(f"/appointments/{FAKE_VALID_ID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Запис не знайдено"


def test_get_appointment_invalid_id(client):
    """
    Тест отримання запису за невалідним ID.
    Очікуємо 400.
    """
    response = client.get(f"/appointments/{INVALID_ID}")

    assert response.status_code == 400
    assert response.json()["detail"] == "Невалідний формат ID"
