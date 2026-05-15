import pytest
import mongomock

from modules.users_module.infrastructure.persistence.SpecializationRepository import SpecializationRepository
from modules.users_module.domains.specialization.Specialization import Specialization


@pytest.fixture
def spec_repo():
    client = mongomock.MongoClient()
    return SpecializationRepository(client.test_db.specializations)


def test_create_and_get_all(spec_repo):
    spec_repo.create(Specialization(name="Кардіолог", description="Серце"))
    spec_repo.create(Specialization(name="Невролог", description="Нерви"))

    all_specs = spec_repo.get_all()
    assert len(all_specs) == 2


def test_get_by_name_case_insensitive(spec_repo):
    """Перевірка regex-пошуку (важливо для вашої бізнес-логіки)"""
    spec_repo.create(Specialization(name="Терапевт", description=""))

    # Шукаємо маленькими літерами
    found = spec_repo.get_by_name("терапевт")
    assert found is not None
    assert found["name"] == "Терапевт"
