🏥 Avyro — Clinic Online
Avyro — це інноваційна телемедична платформа, що забезпечує швидкий та безпечний зв'язок між лікарем і пацієнтом. Проєкт реалізований з акцентом на захист персональних даних та стабільність відеозв'язку.

Value Proposition: Ми робимо якісну медичну допомогу доступною в один клік, автоматизуючи запис, оплату та консультації.

✨ Ключові можливості (Features)
Smart Scheduling: Інтерактивний календар для запису до профільних спеціалістів.

Video Consultations: Захищені онлайн-дзвінки в реальному часі (WebRTC).

Instant Payments: Швидка оплата через інтегрований Monobank API.

Electronic Health Records: Особистий кабінет пацієнта з історією хвороб та призначеннями.

Notifications: Автоматичні нагадування про візити через SMS/Email.

🛠 Технологічний стек (Tech Stack)
Frontend
State Management: Zustand / Redux Toolkit

Data Fetching: TanStack Query

Backend
Validation: Pydantic v2

Database: PostgreSQL 16

📸 Демонстрація (Screenshots / Demo)
Додайте посилання на Live Demo або скріншоти інтерфейсу в папку /assets/screenshots

🚀 Початок роботи (Getting Started)
Prerequisites
Node.js: v20.x (LTS)

Python: v3.12+

Installation & Running
Клонуйте репозиторій:

Bash
git clone https://github.com/OleksandrHelevan/avyro.git
Налаштування Frontend:

Bash
cd frontend
npm install
cp .env.example .env
npm run dev
Налаштування Backend:

Bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
Environment Variables
Переконайтеся, що ви заповнили наступні змінні у своєму .env:

VITE_API_URL — адреса вашого бекенду.

MONO_API_TOKEN — ваш персональний токен Monobank API.

📏 Стандарти розробки (Code Quality)
Для автоматизації контролю якості в проєкті налаштовано:

Linter: ESLint (Airbnb Style Guide).

Formatter: Prettier.

Naming: PascalCase для компонентів, camelCase для функцій, snake_case для БД/API.

Automation: Увімкнено Format on Save для WebStorm та VS Code.

👥 Команда (Team)
Руснак Василь — Frontend Developer (React, TS, SCSS)

Островський Владислав — Backend Developer (Python, FastAPI)

Невмивана Дарина — QA

Федорюк Мірча - DB

Гелеван Олександр - PM
