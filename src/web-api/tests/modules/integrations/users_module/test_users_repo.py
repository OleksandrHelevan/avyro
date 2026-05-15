import pytest
import mongomock
from bson import ObjectId
from datetime import datetime, timezone

from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.users_module.infrastructure.persistence.SpecializationRepository import SpecializationRepository
from modules.users_module.domains.user.User import User
from modules.users_module.domains.user.UserRole import UserRole
from modules.users_module.domains.specialization.Specialization import Specialization


@pytest.fixture
def mock_db():
    client = mongomock.MongoClient()
    return client.test_database


@pytest.fixture
def user_repo(mock_db):
    return UserRepository(mock_db.users)


@pytest.fixture
def spec_repo(mock_db):
    return SpecializationRepository(mock_db.specializations)


def test_create_and_get_user(user_repo):
    """Тестуємо збереження та пошук юзера за email"""
    now = datetime.now(timezone.utc)
    new_user = User(
        email="test_patient@example.com",
        password="hashed_password",
        role=UserRole.PATIENT,
        is_active=True,
        profile=None,
        created_at=now,
        updated_at=now
    )

    # Створюємо в БД
    created = user_repo.create(new_user)
    assert created.id is not None

    # Шукаємо в БД
    found = user_repo.get_by_email("test_patient@example.com")
    assert found is not None
    assert found.email == "test_patient@example.com"
    assert found.role == UserRole.PATIENT


def test_create_and_get_specialization(spec_repo):
    """Тестуємо створення спеціалізації з case-insensitive пошуком"""
    spec = Specialization(name="Хірург", description="Операції")

    # Зберігаємо
    spec_repo.create(spec)

    # Шукаємо точно за назвою
    found_exact = spec_repo.get_by_name("Хірург")
    assert found_exact is not None

    # Шукаємо з іншим регістром (перевірка $regex і $options: 'i')
    found_lower = spec_repo.get_by_name("хірург")
    assert found_lower is not None
    assert found_lower["name"] == "Хірург"
