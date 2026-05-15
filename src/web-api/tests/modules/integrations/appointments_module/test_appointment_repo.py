import pytest
import mongomock
from bson import ObjectId
from datetime import datetime, timezone

from modules.appointments_module.infrastructure.persistence.AppointmentRepository import AppointmentRepository
from modules.appointments_module.domains.appointment.Appointment import Appointment, AppointmentStatus


# Створюємо віртуальну (in-memory) базу даних для тестів
@pytest.fixture
def mock_collection():
    client = mongomock.MongoClient()
    db = client.test_database
    return db.appointments  # Повертаємо тестову колекцію


@pytest.fixture
def repo(mock_collection):
    return AppointmentRepository(mock_collection)


def test_create_appointment(repo, mock_collection):
    """Перевіряємо, чи запис реально зберігається в MongoDB"""
    appointment = Appointment(
        patient_id=ObjectId(),
        slot_id=ObjectId(),
        doctor_id=ObjectId(),
        from_time=datetime.now(timezone.utc),
        to_time=datetime.now(timezone.utc)
    )

    # Метод має додати ID
    created = repo.create(appointment)
    assert created.id is not None

    # Перевіряємо напряму в базі
    doc_in_db = mock_collection.find_one({"_id": created.id})
    assert doc_in_db is not None
    assert doc_in_db["doctorId"] == appointment.doctor_id
    assert doc_in_db["status"] == AppointmentStatus.PLANNED.value


def test_get_by_id_found(repo):
    """Перевіряємо читання з бази за ID"""
    # 1. Створюємо запис
    appointment = Appointment(
        patient_id=ObjectId(), slot_id=ObjectId(), doctor_id=ObjectId(),
        from_time=datetime.now(timezone.utc), to_time=datetime.now(timezone.utc)
    )
    created = repo.create(appointment)

    # 2. Шукаємо його
    found = repo.get_by_id(created.id)

    assert found is not None
    assert found.id == created.id
    assert isinstance(found, Appointment)


def test_get_by_id_not_found(repo):
    """Перевіряємо поведінку при пошуку неіснуючого ID"""
    found = repo.get_by_id(ObjectId())
    assert found is None


def test_get_by_patient_id(repo):
    """Перевіряємо пошук усіх записів конкретного пацієнта"""
    patient_id = ObjectId()

    # Створюємо 2 записи для цього пацієнта
    repo.create(Appointment(patient_id=patient_id, slot_id=ObjectId(), doctor_id=ObjectId(),
                            from_time=datetime.now(timezone.utc), to_time=datetime.now(timezone.utc)))
    repo.create(Appointment(patient_id=patient_id, slot_id=ObjectId(), doctor_id=ObjectId(),
                            from_time=datetime.now(timezone.utc), to_time=datetime.now(timezone.utc)))

    # Створюємо 1 запис для ІНШОГО пацієнта
    repo.create(Appointment(patient_id=ObjectId(), slot_id=ObjectId(), doctor_id=ObjectId(),
                            from_time=datetime.now(timezone.utc), to_time=datetime.now(timezone.utc)))

    # Шукаємо
    results = repo.get_by_patient_id(patient_id)

    assert len(results) == 2
    for app in results:
        assert app.patient_id == patient_id
