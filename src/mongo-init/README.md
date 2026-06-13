# Avyro MongoDB migrations — dev branch version

Generated from the uploaded `avyro-dev.zip`, especially:

- `src/mongo-init/init.js`
- `src/mongo-init/seed.js`
- backend domain/entities from `src/web-api/modules/**/domains`
- backend repositories/services that define actual Mongo collection names.

## Backend entities / collections found in dev

- `Users` — `modules/users_module/domains/user/User.py`, `Profile.py`
- `Specializations` — `modules/users_module/domains/specialization/Specialization.py`
- `Requests` — `modules/requests_module/domains/Request.py`
- `Schedules` — `modules/appointments_module/domains/schedule/Schedule.py`
- `Schedules.slots[]` — `modules/appointments_module/domains/slot/Slot.py`
- `Appointments` — `modules/appointments_module/domains/appointment/Appointment.py`
- `Rewards` — `modules/users_module/domains/reward/Reward.py`
- `Accounts` — `modules/payments_module/domains/Account.py`
- `notifications` — `modules/notifications_module/application/domains/Notification.py`
- `Feedbacks` — `modules/feedback_module/domains/Feedback.py`
- `DoctorReviews` — `modules/feedback_module/domains/DoctorReview.py`
- legacy/seed collections: `Badges`, `Transactions`, `PatientProgress`, standalone `Slots`.

## Migration order

Run scripts in this order:

1. `001_users_specializations.js`
2. `002_schedules_slots.js`
3. `003_appointments.js`
4. `004_requests.js`
5. `005_accounts_notifications.js`
6. `006_rewards_legacy.js`
7. `007_feedback.js`

## Why this dev version is different

The previous migration package was based on an older/main archive. The dev archive contains an additional `feedback_module` with these Mongo collections:

- `Feedbacks`
- `DoctorReviews`

So this package adds `007_feedback.js` and updates the analysis accordingly.

## Before running

Do this only on dev/test DB first.

1. Create a backup.
2. Confirm database name. Scripts use `avyro` by default.
3. Run migrations one by one in order.
4. Check API manually after migration.

Example:

```bash
mongosh "mongodb://localhost:27017/avyro" migrations/001_users_specializations.js
mongosh "mongodb://localhost:27017/avyro" migrations/002_schedules_slots.js
mongosh "mongodb://localhost:27017/avyro" migrations/003_appointments.js
mongosh "mongodb://localhost:27017/avyro" migrations/004_requests.js
mongosh "mongodb://localhost:27017/avyro" migrations/005_accounts_notifications.js
mongosh "mongodb://localhost:27017/avyro" migrations/006_rewards_legacy.js
mongosh "mongodb://localhost:27017/avyro" migrations/007_feedback.js
```

Docker example depends on how `src/mongo-init` is mounted in `docker-compose.yml`.

## Safety rules

- Do not run directly on production/main DB without backup.
- These scripts avoid dropping collections.
- Existing collections are updated through `collMod` and safe `$set` defaults.
- Validation level is `moderate` to avoid breaking legacy documents that cannot be fully normalized automatically.
