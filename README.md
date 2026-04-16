🏥 Avyro — Health Journey Gamification Platform
Avyro — це медична платформа, що перетворює рутинну турботу про здоров'я на захопливий процес досягнення цілей. Ми розв'язуємо проблему браку мотивації до регулярних чекапів, впроваджуючи систему нагород, що конвертуються у реальні фінансові бонуси.

Vision: Сформувати у користувачів стійку звичку до профілактики через гру та відчутне позитивне підкріплення.

✨ Ключові можливості (Features)
🏆 Killer-фіча: Gamification Engine
На відміну від звичайних сервісів запису, Avyro використовує систему "Health Journey":

Миттєві нагороди: Отримання балів та бейджа "Перший крок" одразу після реєстрації.

Прогресія: Нарахування 100 балів за кожен завершений візит.

Фінансова вигода: Безшовна конвертація накопичених балів у реальні знижки або кешбек під час оплати наступних послуг.

📅 Основний функціонал (MVP Scope)
Smart Booking: Пошук лікаря за спеціальністю та бронювання слота в один клік.

Role Selection: Окремі кабінети для Пацієнта (контроль здоров'я) та Лікаря (управління потоком пацієнтів).

Appointment Dashboard: Зручний список майбутніх візитів із можливістю скасування.

Secure Payments: Інтегрована система оплати з можливістю використання бонусів.

🛠 Технологічний стек (Tech Stack)
Frontend: React 18, TypeScript, SCSS Modules (BEM).

Backend: Python 3.12, FastAPI, Pydantic v2.

Database: Mongo DB.

Payment Integration: Monobank API.

DevOps: ESLint (Airbnb), Prettier, EditorConfig.

🎯 Бізнес-цілі (Business Goals)
Retention & Engagement: Досягти залученості 60%+ через ігрові механіки.

Monetization: Конверсія 15% у оплачені візити.

Data Integrity: 100% точність ігрових транзакцій та відсутність конфліктів у розкладі.

🚀 Початок роботи (Getting Started)
Prerequisites
Node.js: v20.x (LTS)

Python: v3.12+

Quick Start
Встановлення: npm install (для фронтенду) та pip install -r requirements.txt (для бекенду).

Налаштування: Скопіюйте .env.example у .env та додайте ваші ключі.

Запуск:

Frontend: npm run dev

Backend: uvicorn main:app --reload

👥 Команда (Team)

Гелеван Олександр - PM

Руснак Василь — Frontend Developer (React)

Островський Владислав — Backend Developer (Python)

Невмивана Дар'я — QA

Федорюк Мірча - DB



---

### Naming Convention

#### Python / FastAPI

* **Файли:** snake_case (booking_service.py, payment_handler.py)
* **Класи:** PascalCase (UserProfile, RewardCalculator)
* **Функції / методи:** snake_case (calculate_rewards(), get_upcoming_appointments())
* **Константи:** UPPER_SNAKE_CASE (MAX_REWARD_POINTS, PAYMENT_TIMEOUT)
* **Пакети / модулі:** нижній регістр із підкресленням (auth, gamification, dashboard)
* **Pydantic моделі:** PascalCase (UserCreate, AppointmentResponse)

#### React / TypeScript

* **Файли компонентів:** PascalCase (AppointmentCard.tsx, BookingForm.tsx)
* **Функціональні компоненти:** PascalCase (BookingDashboard, GamificationBadge)
* **Хуки:** useCamelCase (useAuth, useRewardPoints)
* **Змінні та функції:** camelCase (selectedDoctor, fetchAppointments)
* **Сторінки:** PascalCase + index.tsx у папці (Dashboard/index.tsx)
* **Стилі / SCSS модулі:** camelCase із префіксом модуля (.bookingForm.module.scss)
* **Props / Types:** PascalCase (AppointmentProps, UserProfileType)

#### MongoDB

* **Колекції:** нижній регістр із множиною (users, appointments, rewards)
* **Документи / поля:** camelCase (firstName, lastLogin, rewardPoints)
* **Індекси:** collection_field_idx (appointments_doctorId_idx)
* **Схеми Mongoose / Pydantic:** PascalCase (UserSchema, AppointmentSchema)

 *`docker compose down -v` - якщо бд не оновилась після зміни seed.js то треба видалити volume з даними*
