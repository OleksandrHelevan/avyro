import pytest
import mongomock
from bson import ObjectId
from datetime import datetime, timezone

from modules.requests_module.infrastructure.persistence.RequestRepository import RequestRepository
from modules.requests_module.domains.Request import Request, RequestType, RequestStatus


@pytest.fixture
def request_repo():
    client = mongomock.MongoClient()
    return RequestRepository(client.test_db.requests)


def test_create_and_get_request(request_repo):
    """Тест створення та отримання заявки за ID"""
    new_req = Request(
        creator_id=None,
        type=RequestType.DOCTOR_REGISTRATION,
        payload={"email": "doctor@example.com", "role": "DOCTOR"}
    )

    created = request_repo.create(new_req)
    assert created.id is not None

    found = request_repo.get_by_id(created.id)
    assert found is not None
    assert found.type == RequestType.DOCTOR_REGISTRATION
    assert found.status == RequestStatus.PENDING
    assert found.payload["email"] == "doctor@example.com"


def test_update_request_status(request_repo):
    """Тест оновлення статусу заявки адміном"""
    new_req = Request(
        creator_id=ObjectId(),
        type=RequestType.SCHEDULE_CREATION,
        payload={}
    )
    created = request_repo.create(new_req)

    admin_id = ObjectId()
    # Оновлюємо статус на APPROVED
    success = request_repo.update_status(
        created.id,
        RequestStatus.APPROVED,
        admin_id,
        "Схвалено!"
    )

    assert success is True

    # Дістаємо оновлену заявку
    updated = request_repo.get_by_id(created.id)
    assert updated.status == RequestStatus.APPROVED
    assert updated.processed_by == admin_id
    assert updated.admin_comment == "Схвалено!"
