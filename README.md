<div align="center">

# 🏥 Avyro — Health Journey Platform

**Повнофункціональна медична платформа для онлайн-запису до лікарів**

[![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

[🌐 Live Demo](https://avyro-drab.vercel.app/) • [📖 API Docs](https://avyro.onrender.com/docs) • [💻 Repository](https://github.com/OleksandrHelevan/avyro)

</div>

---

## ✨ Функціонал

| Модуль | Опис |
|--------|------|
| 🗓 **Запис до лікаря** | Перегляд розкладу, вибір слота, бронювання з підтвердженням |
| 💳 **Оплата** | Списання з балансу, бонусні бали (MONEY / POINTS / MIXED), Stripe-інтеграція |
| 🎮 **Гейміфікація** | Бонусні бали за візити, бейджі, прогрес пацієнта |
| ❌ **Скасування** | З перевіркою 2-годинного ліміту та поверненням коштів |
| ✅ **Завершення прийому** | Лікар фіналізує візит, пацієнт отримує бонуси |
| 🛡 **Адмін-панель** | Управління реєстрацією лікарів і спеціалізаціями |
| 🔔 **Сповіщення** | Push-нотифікації при бронюванні, скасуванні та завершенні |
| 💬 **Фідбек** | Відгуки про платформу та відгуки про лікарів |
| 📊 **Swagger UI** | Інтерактивна документація API |

---

## 🏗 Архітектура

```
┌─────────────┐     HTTP      ┌─────────────┐     PyMongo    ┌──────────────┐
│  web-app    │ ────────────► │   web-api   │ ─────────────► │   mongo-db   │
│  React/Vite │               │  FastAPI    │                │  MongoDB 7.0 │
│  :3000      │               │  :8000      │                │  :27017      │
└─────────────┘               └─────────────┘                └──────────────┘
                                      │                               │
                               ┌──────▼──────┐               ┌───────▼──────┐
                               │   Stripe    │               │ mongo-admin  │
                               │  Payments   │               │   :8081      │
                               └─────────────┘               └──────────────┘
```

### Модульна структура бекенду (DDD)

```
modules/
├── appointments_module/   # Записи, розклади, слоти
├── payments_module/       # Баланс, Stripe, інвойси
├── users_module/          # Лікарі, пацієнти, авторизація
├── admin_module/          # Адміністрування запитів
├── notifications_module/  # Push-сповіщення
├── feedback_module/       # Відгуки та оцінки
└── requests_module/       # Черга запитів на розгляд
```

---

## 🛠 Технологічний стек

| Шар | Технологія | Версія |
|-----|-----------|--------|
| Backend | Python, FastAPI, PyMongo | 3.12 / 0.100+ / 4.x |
| Frontend | React, Vite, TypeScript | 18 / 5.x / 5.x |
| База даних | MongoDB | 7.0 |
| Оплата | Stripe API | Latest |
| Авторизація | JWT (Bearer token) | — |
| Контейнеризація | Docker, Docker Compose | 24+ / 2.0+ |
| Тестування | pytest, pytest-asyncio | — |

---

## 🚀 Швидкий старт

### Вимоги

- Docker >= 24.0
- Docker Compose >= 2.0

### Запуск

```bash
# 1. Клонуй репозиторій
git clone https://github.com/OleksandrHelevan/avyro.git
cd avyro

# 2. Скопіюй змінні середовища
cp .env.example .env

# 3. Заповни .env (мінімум: STRIPE_SECRET_KEY, JWT_SECRET)
nano .env

# 4. Запусти
docker compose up --build
```

### Сервіси після запуску

| Сервіс | URL | Опис |
|--------|-----|------|
| 🌐 Frontend | http://localhost:3000 | React застосунок |
| ⚡ Backend API | http://localhost:8000 | FastAPI сервер |
| 📖 Swagger UI | http://localhost:8000/docs | Документація API |
| 🗄 Mongo Express | http://localhost:8081 | Адмін БД (`admin` / `pass`) |

---

## 🔐 Змінні середовища

Скопіюй `.env.example` → `.env` і заповни значення.

| Змінна | Обов'язкова | Опис |
|--------|:-----------:|------|
| `JWT_SECRET` | ✅ | Секрет для підпису JWT токенів (мін. 32 символи) |
| `STRIPE_SECRET_KEY` | ✅ | Секретний ключ Stripe (`sk_test_...` або `sk_live_...`) |
| `STRIPE_PUBLISHABLE_KEY` | ✅ | Публічний ключ Stripe (`pk_test_...`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | Секрет Stripe Webhook (`whsec_...`) |
| `VITE_STRIPE_PUBLIC_KEY` | ✅ | Публічний ключ для фронтенду |
| `MONGO_URL` | ✅ | URI підключення до MongoDB |
| `MONGO_DB_NAME` | ✅ | Назва бази даних |
| `JWT_ALGORITHM` | — | Алгоритм JWT (за замовчуванням `HS256`) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | — | Час життя токена в хвилинах |
| `WEB_APP_PORT` | — | Порт фронтенду (за замовчуванням `3000`) |
| `WEB_API_PORT` | — | Порт бекенду (за замовчуванням `8000`) |

> 💡 Для тестування Stripe використовуй тестові ключі з [dashboard.stripe.com](https://dashboard.stripe.com/test/apikeys)

---

## 📖 API документація

🔗 **Live:** https://avyro.onrender.com/docs

Основні групи ендпоінтів:

| Prefix | Метод | Опис |
|--------|-------|------|
| `POST /login` | Public | Авторизація, отримання JWT |
| `POST /register` | Public | Реєстрація пацієнта |
| `/appointments` | Patient/Doctor | Записи, скасування, завершення |
| `/schedules` | Doctor/Admin | Розклади лікарів |
| `/payments` | Patient | Баланс, поповнення, оплата |
| `/admin` | Admin | Адміністрування запитів |
| `/feedback` | Patient/Admin | Відгуки про платформу |
| `/feedback/doctor-review` | Patient | Відгуки про лікарів |
| `/notifications` | All | Сповіщення |

---

## 🧪 Тести

```bash
# Запуск через Docker
docker compose run --rm web-api pytest

# Або локально (з активованим venv)
cd src/web-api
pytest -v
```

---

## 📁 Структура проєкту

```
avyro/
├── src/
│   ├── web-api/                      # FastAPI backend
│   │   ├── main.py                   # Точка входу, lifespan, middleware
│   │   ├── config/
│   │   │   ├── db.py                 # MongoDB підключення
│   │   │   ├── dependencies.py       # DI-контейнер
│   │   │   ├── permissions.py        # RoleChecker, JWT guard
│   │   │   └── security.py           # JWT утиліти
│   │   ├── modules/
│   │   │   ├── appointments_module/  # Записи, розклади, слоти
│   │   │   ├── payments_module/      # Stripe, баланс, інвойси
│   │   │   ├── users_module/         # Користувачі, нагороди
│   │   │   ├── admin_module/         # Адмін-запити
│   │   │   ├── notifications_module/ # Сповіщення
│   │   │   ├── feedback_module/      # Відгуки
│   │   │   └── requests_module/      # Черга запитів
│   │   └── tests/
│   │       ├── unit/
│   │       └── integrations/
│   └── web-app/                      # React frontend
│       ├── src/
│       └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔗 Project Resources

| Ресурс | Посилання |
|--------|-----------|
| 🌐 Frontend (Production) | https://avyro-drab.vercel.app/ |
| 📖 API Swagger (Production) | https://avyro.onrender.com/docs |
| 💻 GitHub Repository | https://github.com/OleksandrHelevan/avyro |

---

## 👥 Команда

| Роль | Відповідальність |
|------|-----------------|
| Backend | FastAPI, MongoDB, Stripe, архітектура |
| Frontend | React, Vite, TypeScript, UI/UX |

---

<div align="center">

Made with ❤️ by Avyro Team · [MIT License](LICENSE)

</div>
