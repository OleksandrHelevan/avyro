# ADR: System Style (Avyro)

## Status
Accepted

## Context

**Avyro** — платформа для взаємодії пацієнтів і лікарів:

- Auth (Patient / Doctor)
- Search & Booking
- Online Payments
- Gamification (Health Journey)
- Dashboard

**Stack:**
- Frontend: Next.js, React
- Backend: FastAPI
- DB: MongoDB

**Requirements:**
- Fast MVP delivery
- No double booking
- Payment consistency
- Simple development

---

## Decision

**Modular Monolith**

---

## Rationale

### Microservices

- Overkill для MVP (infra, DevOps)
- Складна консистентність (Saga, eventual consistency)
- Ризик: payment success - reward fail
- Double booking складніше контролювати
- Мала команда

### Modular Monolith

- Єдина транзакція (booking + payment + rewards)
- Простий деплой
- Швидка розробка
- Менше latency
- MongoDB - гнучка схема

---

## Architecture

### Modules

- Auth
- User
- Booking
- Payment
- Gamification
- Dashboard

### Rules

- Interaction через services / interfaces
- No direct DB access між модулями

---

## Consequences

### Pros
- Fast MVP
- Simple deploy
- Strong consistency
- Low DevOps

### Cons
- Limited scaling
- Risk of coupling
- Growing codebase

---

## Mitigation

- Clean Architecture
- Package-by-feature
- DTO + Interfaces
- Booking validation (no overlap)
- Payment idempotency

---

## Future

### Extractable services:
- Payment
- Gamification
- Notifications

### Strategy:
1. Strong module boundaries
2. Internal APIs
3. Gradual extraction

---

## Summary

**Modular Monolith** = best fit for MVP - simple, consistent, fast

Microservices - later stage
