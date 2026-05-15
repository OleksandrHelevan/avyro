import pytest
from fastapi.testclient import TestClient

# Замініть на правильний шлях до вашого FastAPI app
from main import app
from config.security import get_current_user
from config.permissions import allow_admin, allow_doctor, allow_patient
from bson import ObjectId


VALID_ADMIN_ID = str(ObjectId())
VALID_DOCTOR_ID = str(ObjectId())
VALID_PATIENT_ID = str(ObjectId())


app.dependency_overrides[allow_admin] = lambda: {"sub": str(ObjectId()), "role": "ADMIN"}
app.dependency_overrides[allow_doctor] = lambda: {"sub": str(ObjectId()), "role": "DOCTOR"}
app.dependency_overrides[allow_patient] = lambda: {"sub": str(ObjectId()), "role": "PATIENT"}


@pytest.fixture(scope="session")
def client():
    # Заглушка для авторизації, щоб не генерувати токени для кожного тесту
    def override_get_current_user():
        return {"sub": "69f3d35cdb97b55f48c73d9d", "role": "DOCTOR"}  # Або PATIENT

    app.dependency_overrides[get_current_user] = override_get_current_user
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

