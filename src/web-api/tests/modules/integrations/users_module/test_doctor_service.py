import pytest
from unittest.mock import MagicMock
from bson import ObjectId
from fastapi import HTTPException

from modules.users_module.application.services.DoctorService import DoctorService
from modules.users_module.domains.user.User import User
from modules.users_module.domains.user.UserRole import UserRole


@pytest.fixture
def doctor_service():
    return DoctorService(
        user_repository=MagicMock(),
        spec_repository=MagicMock(),
        schedule_repository=MagicMock()
    )


def test_get_doctor_by_id_success(doctor_service):
    """Тест успішного отримання профілю лікаря"""
    doc_id = ObjectId()

    # Імітуємо юзера з базою
    mock_user = User(
        email="doctor@test.com", password="123", role="DOCTOR",  # <--- Просто рядок
        is_active=True, profile=None, created_at=None, updated_at=None, _id=doc_id
    )
    doctor_service.user_repository.get_by_id.return_value = mock_user
    doctor_service.schedule_repository.get_all_by_doctor_id.return_value = []

    result = doctor_service.get_doctor_by_id(str(doc_id))

    assert result["email"] == "doctor@test.com"
    assert result["_id"] == str(doc_id)


def test_get_doctor_not_found(doctor_service):
    """Тест: юзера немає в базі"""
    doctor_service.user_repository.get_by_id.return_value = None

    with pytest.raises(HTTPException) as exc:
        doctor_service.get_doctor_by_id(str(ObjectId()))

    assert exc.value.status_code == 404
    assert exc.value.detail == "Користувача не знайдено"
