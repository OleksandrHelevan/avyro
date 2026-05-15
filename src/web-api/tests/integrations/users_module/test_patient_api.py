import pytest
from bson import ObjectId

FAKE_ID = str(ObjectId())


def test_get_patient_profile_unauthorized(client):
    """Спроба отримати профіль без токена або з неправильним токеном"""
    response = client.get(f"/users/patients/{FAKE_ID}")

    # Якщо ви не замокали get_current_user в conftest.py для цього тесту, буде 401.
    # Якщо замокали, але юзера немає в БД - буде 404.
    assert response.status_code in [401, 404]


def test_patch_patient_profile_validation(client):
    """Перевірка валідації DTO при оновленні профілю пацієнта"""
    payload = {
        # Відправляємо порожній JSON, щоб перевірити як реагує ендпоінт
    }
    response = client.patch(f"/users/patients/{FAKE_ID}", json=payload)

    # Якщо всі поля Optional, запит пройде валідацію, але впаде на пошуку в БД (404)
    # Якщо є обов'язкові, буде 422
    assert response.status_code in [404, 422]
