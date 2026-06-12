# Avyro MongoDB migrations

Generated from `src/mongo-init/init.js`, `src/mongo-init/seed.js` and backend entities/domains in `src/web-api/modules`.

## Backend entities / collections found

- `Users` — `modules/users_module/domains/user/User.py`, `Profile.py`
- `Specializations` — `modules/users_module/domains/specialization/Specialization.py`
- `Requests` — `modules/requests_module/domains/Request.py`
- `Schedules` — `modules/appointments_module/domains/schedule/Schedule.py`
- `Schedule.slots[]` — `modules/appointments_module/domains/slot/Slot.py`
- `Appointments` — `modules/appointments_module/domains/appointment/Appointment.py`
- `Rewards` — `modules/users_module/domains/reward/Reward.py`
- `Accounts` — `modules/payments_module/domains/Account.py`
- `notifications` — `modules/notifications_module/application/domains/Notification.py`
- legacy/seed collections: `Badges`, `Transactions`, `PatientProgress`, standalone `Slots`

## Important findings

1. `init.js` does not fully match the current backend models.
2. `seed.js` inserts standalone `Slots`, while the current booking logic searches slots inside `Schedules.slots[]`.
3. `seed.js` references `ids.slots.*`, but the uploaded version does not declare `ids.slots`, so this seed can fail unless fixed.
4. `Appointments.notes` is a string in seed data, but the current backend expects an array of note objects.
5. Current backend uses additional collections not fully initialized in `init.js`: `Requests`, `Accounts`, lowercase `notifications`.
6. Current backend uses new fields in schedules/appointments: `month`, `year`, `slots`, `status`, `pricePerSlot`, `from`, `to`, `discount`, `isDiscountUsed`.

## Before running

Do this only on dev/test DB first.

1. Create backup.
2. Check database name. Scripts use `avyro` by default.
3. Run migrations one by one in order.

Example:

```bash
mongosh "mongodb://localhost:27017/avyro" migrations/001_users_specializations.js
mongosh "mongodb://localhost:27017/avyro" migrations/002_schedules_slots.js
mongosh "mongodb://localhost:27017/avyro" migrations/003_appointments.js
mongosh "mongodb://localhost:27017/avyro" migrations/004_requests.js
mongosh "mongodb://localhost:27017/avyro" migrations/005_accounts_notifications.js
mongosh "mongodb://localhost:27017/avyro" migrations/006_rewards_legacy.js
```

Docker example:

```bash
docker compose exec mongo mongosh "mongodb://localhost:27017/avyro" /docker-entrypoint-initdb.d/migrations/001_users_specializations.js
```

## Safety

These scripts are idempotent-style: they use `createCollection` only when missing, `collMod` when existing, `$set` with default values, and safe index creation with try/catch.
