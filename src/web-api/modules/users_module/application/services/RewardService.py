import logging
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import PyMongoError
from modules.users_module.application.dto.ProfileDto import ProfileUpdateRequest, ProfileUpdateResponse

logger = logging.getLogger(__name__)


async def update_profile_with_reward(
    client: AsyncIOMotorClient,
    user_id: str,
    profile_data: ProfileUpdateRequest
) -> ProfileUpdateResponse:
    db = client.clinic_database
    reward_issued = False

    try:
        async with await client.start_session() as session:
            async with session.start_transaction():

                await db.Users.update_one(
                    {"_id": user_id},
                    {"$set": {
                        "full_name": profile_data.full_name,
                        "phone": profile_data.phone,
                        "profile_completed": True
                    }},
                    session=session
                )


                existing_reward = await db.Rewards.find_one(
                    {"patientId": user_id, "source.type": "PROFILE_BONUS"},
                    session=session
                )


                if not existing_reward:
                    await db.Rewards.insert_one(
                        {
                            "patientId": user_id,
                            "type": "BONUS",
                            "amount": 50,
                            "source": {"type": "PROFILE_BONUS"}
                        },
                        session=session
                    )

                    await db.PatientProgress.update_one(
                        {"patientId": user_id},
                        {
                            "$inc": {"totalEarnedPoints": 50},
                            "$set": {"activeBadgeId": "badge_first_step"},
                            "$addToSet": {"badges": "badge_first_step"}
                        },
                        upsert=True,
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
