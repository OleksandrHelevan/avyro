import calendar
from datetime import datetime, timedelta, timezone
from typing import List
from modules.appointments_module.domains.slot.Slot import Slot, SlotType


class SlotService:

    def generate_monthly_slots(self, doctor_id: str, year: int, month: int, config: dict) -> List[Slot]:
        slots = []
        days_of_week = config.get("daysOfWeek", [])
        duration = config.get("slotDuration", 30)
        start_h, start_m = map(int, config["startTime"].split(":"))
        end_h, end_m = map(int, config["endTime"].split(":"))

        _, last_day = calendar.monthrange(year, month)

        for day in range(1, last_day + 1):
            current_date = datetime(year, month, day, tzinfo=timezone.utc)
            if current_date.weekday() in days_of_week:
                slot_time = current_date.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
                work_end = current_date.replace(hour=end_h, minute=end_m, second=0, microsecond=0)

                while slot_time + timedelta(minutes=duration) <= work_end:
                    slots.append(Slot(
                        from_time=slot_time,
                        to_time=slot_time + timedelta(minutes=duration),
                        slot_type=SlotType.AVAILABLE
                    ))
                    slot_time += timedelta(minutes=duration)

        return slots
