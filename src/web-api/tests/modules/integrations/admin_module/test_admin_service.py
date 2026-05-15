import pytest
from unittest.mock import MagicMock
from bson import ObjectId
from fastapi import HTTPException

from modules.admin_module.application.service.AdminRequestService import AdminRequestService
from modules.requests_module.domains.Request import Request, RequestType, RequestStatus


@pytest.fixture
def admin_service():
    return AdminRequestService(
        request_repo=MagicMock(),
        user_service=MagicMock(),
        schedule_service=MagicMock(),
        specialization_service=MagicMock()
    )


def test_approve_registration_success(admin_service):
    """Успішне підтвердження реєстрації лікаря"""
    req_id = ObjectId()
    admin_id = str(ObjectId())

    # Імітуємо PENDING заявку
    mock_req = Request(
        creator_id=None, type=RequestType.DOCTOR_REGISTRATION, status=RequestStatus.PENDING,
        payload={"email": "doc@test.com", "password": "123", "role": "DOCTOR"}, _id=req_id
    )
    admin_service.request_repo.get_by_id.return_value = mock_req

    # Імітуємо, що такого юзера ще немає
    admin_service.user_service.get_user_by_email.return_value = None

    # Імітуємо успішне створення юзера
    admin_service.user_service.create_user_final.return_value = {"email": "doc@test.com"}

    result = admin_service.approve_registration(str(req_id), admin_id)

    assert result["email"] == "doc@test.com"
    admin_service.user_service.create_user_final.assert_called_once()
    admin_service.request_repo.update_status.assert_called_once_with(
        req_id, RequestStatus.APPROVED, ObjectId(admin_id)
    )


def test_approve_registration_conflict(admin_service):
    """Спроба підтвердити реєстрацію, якщо email вже зайнятий"""
    req_id = ObjectId()
    admin_id = str(ObjectId())

    mock_req = Request(
        creator_id=None, type=RequestType.DOCTOR_REGISTRATION, status=RequestStatus.PENDING,
        payload={"email": "doc@test.com", "password": "123", "role": "DOCTOR"}, _id=req_id
    )
    admin_service.request_repo.get_by_id.return_value = mock_req

    # Імітуємо, що такий юзер ВЖЕ Є в базі
    admin_service.user_service.get_user_by_email.return_value = {"email": "doc@test.com"}

    with pytest.raises(HTTPException) as exc:
        admin_service.approve_registration(str(req_id), admin_id)

    assert exc.value.status_code == 400
    assert "Користувач вже існує" in exc.value.detail

    # Перевіряємо, чи заявку автоматично відхилили (REJECTED)
    admin_service.request_repo.update_status.assert_called_once_with(
        req_id, RequestStatus.REJECTED, ObjectId(admin_id), "Користувач з такою електронною адресою вже зареєстрований"
    )
