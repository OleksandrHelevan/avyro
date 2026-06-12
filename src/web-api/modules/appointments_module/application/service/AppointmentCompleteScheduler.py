import asyncio
from datetime import datetime, timezone
from config.logging_config import logger
from config.db import db
from bson import ObjectId
from modules.users_module.domains.reward.Reward import Reward, RewardType, RewardSource
from modules.users_module.infrastructure.persistence.RewardRepository import RewardRepository


async def complete_finished_appointments():
    while True:
        try:
            now = datetime.now(timezone.utc)
            reward_repo = RewardRepository(db["Rewards"])

            finished = list(db["Appointments"].find({
                "status": "FINISHED",
                "to": {"$lte": now}
            }))

            for appointment in finished:
                appointment_id = appointment["_id"]
                patient_id = appointment.get("patientId")

                db["Appointments"].update_one(
                    {"_id": appointment_id},
                    {"$set": {"status": "COMPLETED", "updatedAt": now}}
                )
                logger.info(f"[AppointmentCompleter] {appointment_id} → COMPLETED")

                # Нарахування балів за перший візит
                if patient_id:
                    try:
                        patient_oid = ObjectId(patient_id) if not isinstance(patient_id, ObjectId) else patient_id

                        if not reward_repo.has_first_visit_bonus(patient_oid):
                            reward = Reward(
                                patientId=patient_oid,
                                type=RewardType.BONUS,
                                points=100,
                                source=RewardSource.FIRST_VISIT_BONUS,
                                description="Бонус за перший завершений візит до лікаря"
                            )
                            reward_repo.create(reward)
                            logger.info(f"[AppointmentCompleter] Нараховано 100 балів пацієнту {patient_oid}")
                    except Exception as e:
                        logger.error(f"[AppointmentCompleter] Помилка нарахування балів: {e}")

        except Exception as e:
            logger.error(f"[AppointmentCompleter] Помилка: {e}")

        await asyncio.sleep(60)


def start_appointment_completer():
    asyncio.create_task(complete_finished_appointments())
