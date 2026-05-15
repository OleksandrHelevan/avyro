import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException

from modules.users_module.application.services.SpecializationService import SpecializationService
from modules.users_module.application.dto.SpecializationDto import CreateSpecializationRequest


@pytest.fixture
def spec_service():
    return SpecializationService(
        repository=MagicMock(),
        request_repository=MagicMock()
    )


def test_create_specialization_direct_conflict(spec_service):
    """Тест: адмін намагається створити спеціалізацію, яка вже є"""
    spec_service.repository.get_by_name.return_value = {"name": "Хірург"}

    req = CreateSpecializationRequest(name="Хірург", description="")

    with pytest.raises(HTTPException) as exc:
        spec_service.create_specialization_direct(req)

    assert exc.value.status_code == 400
    assert "вже існує" in exc.value.detail
