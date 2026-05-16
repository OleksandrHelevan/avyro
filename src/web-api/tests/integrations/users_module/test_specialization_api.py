import pytest
from bson import ObjectId

FAKE_ID = str(ObjectId())


def test_get_all_specializations(client):
    """Отримання списку спеціалізацій"""
    response = client.get("/specializations/")

    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_specialization_by_id_invalid(client):
    """Передача невалідного ObjectId"""
    response = client.get("/specializations/invalid-format")

    assert response.status_code == 400
    assert response.json()["detail"] == "Невалідний формат ID спеціалізації"


def test_create_specialization_request_missing_fields(client):
    """Спроба створити заявку на спеціалізацію без обов'язкового поля 'name'"""
    payload = {
        "description": "Опис без назви"
    }
    response = client.post("/specializations/", json=payload)

    assert response.status_code == 422
    assert "name" in response.json()["detail"][0]["loc"]
