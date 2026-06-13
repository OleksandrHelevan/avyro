# Migration analysis — dev branch

## Source used

This package was generated after checking the uploaded `avyro-dev.zip`, not the old `avyro-main.zip` archive.

Checked files:

- `src/mongo-init/init.js`
- `src/mongo-init/seed.js`
- `src/web-api/config/dependencies.py`
- `src/web-api/modules/**/domains/*.py`
- `src/web-api/modules/**/infrastructure/persistence/*.py`

## Collections expected by the current dev backend

| Collection | Backend source |
|---|---|
| `Users` | `User.py`, `Profile.py`, `UserRepository.py` |
| `Specializations` | `Specialization.py`, `SpecializationRepository.py` |
| `Requests` | `Request.py`, `RequestRepository.py` |
| `Schedules` | `Schedule.py`, `ScheduleRepository.py` |
| `Schedules.slots[]` | `Slot.py`, `ScheduleRepository.book_slot()` |
| `Appointments` | `Appointment.py`, `AppointmentRepository.py` |
| `Rewards` | `Reward.py`, `RewardRepository.py` |
| `Accounts` | `Account.py`, `AccountRepository.py` |
| `notifications` | `NotificationRepository.py` |
| `Feedbacks` | `Feedback.py`, `FeedbackRepository.py` |
| `DoctorReviews` | `DoctorReview.py`, `FeedbackRepository.py` |

## Main findings

1. `init.js` still does not fully match the dev backend models.
2. `seed.js` inserts standalone `Slots`, while booking logic works with `Schedules.slots[]`.
3. `seed.js` references `ids.slots.*`, but in the checked archive `ids.slots` is not declared. That seed can fail unless fixed separately.
4. Appointment notes in seed are strings, while the dev backend expects `notes` as an array of note objects.
5. Appointment dev entity expects additional fields: `from`, `to`, `invoiceId`, `pointsUsed`, `moneyCharged`, `discount`, `isDiscountUsed`.
6. `Rewards` dev enum contains more sources than old init allowed: visit-count, loyalty and same-doctor/specialization bonuses.
7. The dev branch contains `feedback_module`, so migrations must include `Feedbacks` and `DoctorReviews`.
8. Notification collection is lowercase `notifications`, not `Notifications`.
9. Payments use `Accounts` with snake_case fields like `user_id`, `stripe_customer_id`, `created_at`, `updated_at`.

## Recommended migration order

1. Users and Specializations
2. Schedules and embedded slots
3. Appointments
4. Requests
5. Accounts and notifications
6. Rewards and legacy seed collections
7. Feedbacks and DoctorReviews

## Notes for PR

PR should mention that this version is based on `dev` backend entities and includes the missing feedback entity migrations.
