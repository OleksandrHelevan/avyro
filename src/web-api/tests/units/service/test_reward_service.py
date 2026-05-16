import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException, status
from pymongo.errors import PyMongoError

# Замініть ці імпорти на реальні шляхи у вашому проєкті
from modules.users_module.application.services.RewardService import RewardService
from modules.users_module.application.dto.ProfileDto import ProfileUpdateRequest


# ==========================================
# ФІКСТУРИ (Налаштування моків)
# ==========================================

@pytest.fixture
def mock_user_repo():
    return AsyncMock()


@pytest.fixture
def mock_reward_repo():
    return AsyncMock()


@pytest.fixture
def mock_progress_repo():
    return AsyncMock()


@pytest.fixture
def mock_session():
    """Створюємо ідеальний мок для сесії та транзакції"""
    session = MagicMock()
    # Мокаємо поведінку: async with ... as session:
    session.__aenter__ = AsyncMock(return_value=session)
    session.__aexit__ = AsyncMock(return_value=None)

    # Мокаємо поведінку: async with session.start_transaction():
    transaction_cm = MagicMock()
    transaction_cm.__aenter__ = AsyncMock(return_value=None)
    transaction_cm.__aexit__ = AsyncMock(return_value=None)
    session.start_transaction.return_value = transaction_cm

    return session


@pytest.fixture
def mock_client(mock_session):
    """Створюємо мок для клієнта БД"""
    client = MagicMock()
    # Мокаємо поведінку: await self.client.start_session()
    client.start_session = AsyncMock(return_value=mock_session)
    return client


@pytest.fixture
def reward_service(mock_user_repo, mock_reward_repo, mock_progress_repo, mock_client):
    return RewardService(
        user_repository=mock_user_repo,
        reward_repository=mock_reward_repo,
        progress_repository=mock_progress_repo,
        client=mock_client
    )


@pytest.fixture
def profile_request():
    request = MagicMock(spec=ProfileUpdateRequest)
    request.full_name = "Іван Іванов"
    request.phone = "+380990000000"
    return request


# ==========================================
# ТЕСТИ
# ==========================================

@pytest.mark.asyncio
async def test_update_profile_issues_new_reward(
    reward_service, mock_user_repo, mock_reward_repo, mock_progress_repo, mock_session, profile_request
):
    # Arrange
    user_id = "test_user_123"
    mock_reward_repo.has_profile_bonus.return_value = False

    # Act
    result = await reward_service.update_profile_with_reward(user_id, profile_request)

    # Assert
    assert result.status == "success"
    assert result.reward_issued is True
    assert result.message == "Профіль успішно збережено"

    mock_user_repo.update_profile_status.assert_called_once_with(
        user_id, profile_request.full_name, profile_request.phone, session=mock_session
    )
    mock_reward_repo.has_profile_bonus.assert_called_once_with(user_id, session=mock_session)
    mock_reward_repo.create_bonus.assert_called_once_with(user_id, amount=50, session=mock_session)
    mock_progress_repo.add_points_and_badge.assert_called_once_with(
        user_id, points=50, badge_id="badge_first_step", session=mock_session
    )


@pytest.mark.asyncio
async def test_update_profile_skips_reward_if_already_exists(
    reward_service, mock_user_repo, mock_reward_repo, mock_progress_repo, mock_session, profile_request
):
    # Arrange
    user_id = "test_user_123"
    mock_reward_repo.has_profile_bonus.return_value = True

    # Act
    result = await reward_service.update_profile_with_reward(user_id, profile_request)

    # Assert
    assert result.status == "success"
    assert result.reward_issued is False

    mock_user_repo.update_profile_status.assert_called_once()
    mock_reward_repo.has_profile_bonus.assert_called_once()

    mock_reward_repo.create_bonus.assert_not_called()
    mock_progress_repo.add_points_and_badge.assert_not_called()


@pytest.mark.asyncio
async def test_update_profile_handles_pymongo_error(
    reward_service, mock_user_repo, profile_request
):
    # Arrange
    user_id = "test_user_123"
    mock_user_repo.update_profile_status.side_effect = PyMongoError("Connection lost")

    # Act & Assert
    with pytest.raises(HTTPException) as exc_info:
        await reward_service.update_profile_with_reward(user_id, profile_request)

    assert exc_info.value.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
    assert exc_info.value.detail == "Не вдалося зберегти дані профілю."
