# 🏥 MedBook — Медична платформа для запису до лікарів

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green?logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen?logo=mongodb)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)
![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Повнофункціональна платформа для онлайн-запису пацієнтів до лікарів із системою оплати, бонусних балів та сповіщень.

---

## 📋 Зміст

- [Функціонал](#-функціонал)
- [Архітектура](#-архітектура)
- [Технологічний стек](#-технологічний-стек)
- [Швидкий старт](#-швидкий-старт)
- [Змінні середовища](#-змінні-середовища)
- [API документація](#-api-документація)
- [Структура проєкту](#-структура-проєкту)

---

## ✨ Функціонал

- **Запис до лікаря** — перегляд розкладу, вибір слота, бронювання
- **Оплата** — списання з балансу, бонусні бали (MONEY / POINTS / MIXED)
- **Скасування візиту** — з перевіркою 2-годинного ліміту
- **Завершення прийому** — лікар фіналізує візит, пацієнт отримує бонус
- **Адмін-панель** — управління реєстраціями лікарів і спеціалізаціями
- **Stripe-інтеграція** — поповнення балансу, інвойси, прив'язка карток
- **Сповіщення** — push-нотифікації при бронюванні та скасуванні
- **Swagger UI** — інтерактивна документація API

---

## 🏗 Архітектура

```
┌─────────────┐     HTTP      ┌─────────────┐     PyMongo    ┌──────────────┐
│  web-app    │ ────────────► │   web-api   │ ─────────────► │   mongo-db   │
│  React/Vite │               │  FastAPI    │                │  MongoDB 7.0 │
│  :3000      │               │  :8000      │                │  :27017      │
└─────────────┘               └─────────────┘                └──────────────┘
                                                                      │
                                                              ┌───────▼──────┐
                                                              │ mongo-admin  │
                                                              │  :8081       │
                                                              └──────────────┘
```

---

## 🛠 Технологічний стек

| Шар | Технологія |
|-----|-----------|
| Backend | Python 3.12, FastAPI, PyMongo |
| Frontend | React 18, Vite, TypeScript |
| База даних | MongoDB 7.0 |
| Оплата | Stripe API |
| Авторизація | JWT (Bearer token) |
| Контейнеризація | Docker, Docker Compose |
| Тестування | pytest, pytest-asyncio |

---

## 🚀 Швидкий старт

### Вимоги

- Docker >= 24.0
- Docker Compose >= 2.0

### Запуск

```bash
# 1. Клонуй репозиторій
git clone https://github.com/your-org/medbook.git
cd medbook

# 2. Скопіюй змінні середовища
cp .env.example .env

# 3. Заповни .env (мінімум: STRIPE_SECRET_KEY, JWT_SECRET)

# 4. Запусти
docker compose up --build
```

### Сервіси після запуску

| Сервіс | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| Mongo Express | http://localhost:8081 |

Логін до Mongo Express: `admin` / `pass`

---

## 🔐 Змінні середовища

Повний список у файлі [`.env.example`](.env.example).

Обов'язкові для запуску:

| Змінна | Опис |
|--------|------|
| `JWT_SECRET` | Секрет для підпису JWT токенів |
| `STRIPE_SECRET_KEY` | Секретний ключ Stripe (тестовий: `sk_test_...`) |
| `MONGO_URI` | URI підключення до MongoDB |

---

## 📖 API документація

Після запуску доступна за адресою: **http://localhost:8000/docs**

Основні групи ендпоінтів:

| Prefix | Опис |
|--------|------|
| `/auth` | Реєстрація, логін, JWT |
| `/appointments` | Записи, скасування, завершення |
| `/payments` | Баланс, поповнення, оплата |
| `/admin` | Адміністрування |
| `/users` | Профілі користувачів |

---

## 📁 Структура проєкту

```
medbook/
├── web-api/                  # FastAPI backend
│   ├── main.py
│   ├── config/
│   │   ├── dependencies.py
│   │   └── permissions.py
│   └── modules/
│       ├── appointments_module/
│       ├── payments_module/
│       ├── users_module/
│       ├── admin_module/
│       └── requests_module/
├── web-app/                  # React frontend
│   ├── src/
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🧪 Тести

```bash
docker compose run --rm web-api pytest
```

---

## 👥 Команда

| Роль | Відповідальність |
|------|-----------------|
| Backend | FastAPI, MongoDB, Stripe |
| Frontend | React, Vite, UI/UX |
