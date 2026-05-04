import logging
from fastapi import HTTPException, status
from pymongo.errors import PyMongoError

from modules.users_module.application.dto.ProfileDto import ProfileUpdateRequest, ProfileUpdateResponse
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository
from modules.users_module.infrastructure.persistence.RewardRepository import RewardRepository
# Припускаю, що у вас є репозиторій для прогресу, або його треба створити:
from modules.users_module.infrastructure.persistence.SpecializationRepository import SpecializationRepository

logger = logging.getLogger(__name__)

class RewardService:
    def __init__(
        self,
        user_repository: UserRepository,
        reward_repository: RewardRepository,
        progress_repository: SpecializationRepository,
        client
    ):
        self.user_repository = user_repository
        self.reward_repository = reward_repository
        self.progress_repository = progress_repository
        self.client = client

    async def update_profile_with_reward(
        self,
        user_id: str,
        profile_data: ProfileUpdateRequest
    ) -> ProfileUpdateResponse:
        reward_issued = False

        try:
            async with await self.client.start_session() as session:
                async with session.start_transaction():

                    # 1. Оновлення профілю через Репозиторій
                    await self.user_repository.update_profile_status(
                        user_id,
                        profile_data.full_name,
                        profile_data.phone,
                        session=session
                    )

                    # 2. Перевірка нагороди через Репозиторій
                    existing_reward = await self.reward_repository.has_profile_bonus(user_id, session=session)

                    # 3. Нарахування нагороди
                    if not existing_reward:
                        # Створення нагороди через Репозиторій
                        await self.reward_repository.create_bonus(user_id, amount=50, session=session)

                        # Оновлення прогресу через Репозиторій
                        await self.progress_repository.add_points_and_badge(
                            user_id,
                            points=50,
                            badge_id="badge_first_step",
                            session=session
                        )
                        reward_issued = True

        except PyMongoError as e:
            logger.error(f"Помилка транзакції: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Не вдалося зберегти дані профілю."
            )

        return ProfileUpdateResponse(
            status="success",
            reward_issued=reward_issued,
            message="Профіль успішно збережено"
        )
