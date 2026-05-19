import asyncio
from datetime import datetime, timezone

from config.logging_config import logger
from config.db import db


async def clean_expired_slots():
    """
    Видаляє вільні слоти, час завершення яких вже минув.
    Запускається асинхронно кожні 4 години.
    """
    while True:
        try:
            now = datetime.now(timezone.utc)
            logger.info(f"[SlotCleaner] Запуск очищення прострочених слотів. Час: {now}")

            result = db["slots"].delete_many({
                "is_booked": False,
                "end_time": {"$lt": now}
            })

            logger.info(f"[SlotCleaner] Видалено {result.deleted_count} прострочених вільних слотів.")
        except Exception as e:
            logger.error(f"[SlotCleaner] Помилка під час очищення слотів: {e}")

        await asyncio.sleep(4 * 60 * 60)  # 4 години


def start_slot_cleaner():
    """
    Запускає планувальник як фонову asyncio задачу.
    Викликати з lifespan або startup event у main.py.
    """
    asyncio.create_task(clean_expired_slots())
