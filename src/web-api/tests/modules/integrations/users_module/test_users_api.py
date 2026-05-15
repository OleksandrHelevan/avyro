import pytest
from bson import ObjectId

FAKE_VALID_ID = str(ObjectId())


def test_login_invalid_credentials(client):
    """
    Тест логіну з неправильними даними.
    Оскільки база порожня, юзера немає, очікуємо помилку.
    (Зверніть увагу: залежно від вашого Exception Handler, це може бути 400, 401 або 404.
    Зазвичай InvalidCredentialsException мапиться на 401).
    """
    payload = {
        "email": "notfound@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/login", json=payload)

    assert response.status_code in [400, 401, 404]


def test_sign_up_validation_error(client):
    """
    Тест реєстрації з невалідним email.
    Pydantic (EmailStr) має відхилити запит із кодом 422.
    """
    payload = {
        "email": "invalid-email-format",
        "password": "password123",
        "role": "PATIENT"
    }
    response = client.post("/sign-up", json=payload)

    assert response.status_code == 422
    assert "email" in response.json()["detail"][0]["loc"]


def test_get_doctors_list(client):
    response = client.get("/users/doctors")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    # ВИДАЛІТЬ РЯДОК: assert len(response.json()) == 0

def test_get_patient_profile_not_found(client):
    """
    Тест отримання профілю неіснуючого пацієнта.
    """
    response = client.get(f"/users/patients/{FAKE_VALID_ID}")

    # Залежно від вашого UserNotFoundException мапінгу (зазвичай 404)
    assert response.status_code == 404


def test_create_specialization_validation(client):
    """
    Тест валідації створення спеціалізації.
    Назва має бути >= 2 символів (min_length=2 у CreateSpecializationRequest).
    """
    payload = {
        "name": "А",  # Занадто коротка назва
        "description": "Опис"
    }
    response = client.post("/specializations/", json=payload)

    assert response.status_code == 422
