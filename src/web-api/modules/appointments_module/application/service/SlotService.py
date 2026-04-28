from datetime import datetime, timedelta, timezone
from modules.appointments_module.domains.slot.Slot import Slot, SlotType
from modules.appointments_module.domains.schedule.Schedule import Schedule
from modules.appointments_module.infrastructure.persistence.SlotRepository import SlotRepository


class SlotService:
    def __init__(self, slot_repository: SlotRepository):
        self.slot_repository = slot_repository

    def generate_slots_for_schedule(self, schedule: Schedule, days_ahead: int = 30):
        repeating = schedule.repeating

        days_of_week = repeating.get("daysOfWeek", [])
        start_time_str = repeating.get("startTime")
        end_time_str = repeating.get("endTime")
        duration = repeating.get("slotDuration", 30)

        if not start_time_str or not end_time_str:
            return

        start_h, start_m = map(int, start_time_str.split(":"))
        end_h, end_m = map(int, end_time_str.split(":"))

        now = datetime.now(timezone.utc)

        for i in range(days_ahead):
            current_date = now + timedelta(days=i)

            if current_date.weekday() not in days_of_week:
                continue

            slot_start = current_date.replace(hour=start_h, minute=start_m, second=0, microsecond=0)
            work_end = current_date.replace(hour=end_h, minute=end_m, second=0, microsecond=0)

            while slot_start + timedelta(minutes=duration) <= work_end:
                if slot_start > now:
                    new_slot = Slot(
                        schedule_id=schedule.id,
                        doctor_id=schedule.doctor_id,
                        from_time=slot_start,
                        to_time=slot_start + timedelta(minutes=duration),
                        slot_type=SlotType.AVAILABLE,
                        created_at=datetime.now(timezone.utc)
                    )
                    self.slot_repository.create(new_slot)

                slot_start += timedelta(minutes=duration)
