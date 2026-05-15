import pytest
from bson import ObjectId

# Генеруємо валідний випадковий ObjectId для тестування (щоб FastAPI не впав на помилці парсингу)
FAKE_REQUEST_ID = str(ObjectId())


def test_get_registration_requests(client):
    """Тест отримання всіх заявок на реєстрацію"""
    response = client.get("/admin/registrations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_schedule_requests(client):
    """Тест отримання всіх заявок на розклад"""
    response = client.get("/admin/schedules")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_specialization_requests(client):
    """Тест отримання всіх заявок на спеціалізації"""
    response = client.get("/admin/specializations")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_specialization_direct(client):
    """
    Тест прямого створення спеціалізації.
    Замініть поля 'name' та 'description' на ті, які вимагає ваш CreateSpecializationRequest.
    """
    payload = {
        "name": "Кардіолог",
        "description": "Лікування серцево-судинних захворювань"
    }
    response = client.post("/admin/specialization", json=payload)

    # Залежно від того, чи є вже така спеціалізація в базі, може бути 201 або помилка 400
    assert response.status_code in [201, 400, 409]


def test_approve_registration_not_found(client):
    """Тест: спроба підтвердити неіснуючу заявку на реєстрацію (очікуємо 404)"""
    response = client.post(f"/admin/{FAKE_REQUEST_ID}/approve-registration")

    assert response.status_code == 404
    assert response.json()["detail"] == "Запит на реєстрацію не знайдено"


def test_approve_schedule_not_found(client):
    """Тест: спроба підтвердити неіснуючу заявку на розклад (очікуємо 404)"""
    response = client.post(f"/admin/{FAKE_REQUEST_ID}/approve-schedule")

    assert response.status_code == 404
    assert response.json()["detail"] == "Запит на розклад не знайдено"


def test_approve_specialization_not_found(client):
    """Тест: спроба підтвердити неіснуючу заявку на спеціалізацію (очікуємо 404)"""
    response = client.post(f"/admin/{FAKE_REQUEST_ID}/approve-specialization")

    assert response.status_code == 404
    assert response.json()["detail"] == "Запит на спеціалізацію не знайдено"


def test_reject_request(client):
    """
    Тест відхилення заявки.
    ВАЖЛИВО: Оскільки параметр `comment` у контролері вказано просто як `str`
    (а не в складі Pydantic моделі), FastAPI читає його як Query-параметр (в URL).
    """
    comment = "Некоректні дані"
    response = client.post(f"/admin/{FAKE_REQUEST_ID}/reject?comment={comment}")

    assert response.status_code == 200
    # Якщо Request з таким ID не знайдено, repo.update_status поверне False/None
    assert response.json() in [{"status": "failed"}, {"status": "success"}]
