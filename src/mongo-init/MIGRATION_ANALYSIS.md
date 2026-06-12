# Migration analysis

## Why migrations are needed

The Mongo initialization scripts and seed data are behind the current backend entities.
The backend currently expects nested schedule slots, appointment notes as arrays, payment accounts, requests and lowercase notifications.
The old/init database setup only validates part of this structure.

## Recommended migration order

1. Users and Specializations
2. Schedules and embedded slots
3. Appointments
4. Requests
5. Accounts and notifications
6. Rewards and legacy collections

## Main compatibility rules

- Keep legacy data where possible.
- Do not drop production collections.
- Add missing fields with safe defaults.
- Allow both ObjectId and string in a few fields where backend already tolerates both.
- Keep old seed/legacy collections, but align active backend collections first.
