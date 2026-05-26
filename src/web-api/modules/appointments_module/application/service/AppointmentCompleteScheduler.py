import asyncio
from datetime import datetime, timezone
from config.logging_config import logger
from config.db import db


async def complete_finished_appointments():
    """
    Переводить прийоми зі статусом FINISHED у COMPLETED
    після того як минув час слоту (to_time).
    Запускається кожну хвилину.
    """
    while True:
        try:
            now = datetime.now(timezone.utc)
            result = db["Appointments"].update_many(
                {
                    "status": "FINISHED",
                    "to": {"$lte": now}
                },
                {
                    "$set": {
                        "status": "COMPLETED",
                        "updatedAt": now
                    }
                }
            )
            if result.modified_count > 0:
                logger.info(f"[AppointmentCompleter] {result.modified_count} прийомів переведено у COMPLETED")
        except Exception as e:
            logger.error(f"[AppointmentCompleter] Помилка: {e}")
        await asyncio.sleep(60)  # кожну хвилину


def start_appointment_completer():
    asyncio.create_task(complete_finished_appointments())
