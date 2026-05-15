import pytest
from bson import ObjectId

FAKE_ID = str(ObjectId())


def test_get_doctors_list(client):
    """Отримання списку всіх лікарів"""
    response = client.get("/users/doctors")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_doctor_by_id_not_found(client):
    """Пошук лікаря за неіснуючим ID"""
    response = client.get(f"/users/doctors/{FAKE_ID}")

    assert response.status_code == 404
    assert response.json()["detail"] == "Користувача не знайдено"


def test_patch_doctor_profile_validation_error(client):
    """Перевірка валідації DoctorProfileUpdateRequest"""
    payload = {
        "fullName": "А",  # Занадто коротке (min_length=3)
        "specialization_id": FAKE_ID
    }
    response = client.patch(f"/users/doctors/{FAKE_ID}", json=payload)

    # Pydantic має зловити коротке ім'я
    assert response.status_code == 422
    assert "fullName" in response.json()["detail"][0]["loc"]
