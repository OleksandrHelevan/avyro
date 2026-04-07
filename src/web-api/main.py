from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional

# 3.2) Опис метаданих API (згідно з Vision проекту)
app = FastAPI(
    title="Avyro — Health Journey API",
    version="1.0.0",
    description="API для гейміфікованої медичної платформи. Система нагород, запис до лікарів та управління візитами.",
    contact={
        "name": "Островський Владислав (Backend Developer)",
    }
)

# --- Схеми даних (Pydantic моделі згідно з Naming Convention) ---

class AppointmentBase(BaseModel):
    doctor_id: str = Field(..., example="doc_777")
    patient_id: str = Field(..., example="user_42")
    appointment_date: str = Field(..., example="2026-05-20T10:30:00")

class AppointmentResponse(AppointmentBase):
    id: str = Field(..., example="65f1a2b3c4d5e6f7g8h9")
    status: str = Field(..., example="confirmed")

class RewardPoints(BaseModel):
    points: int = Field(..., example=100)
    badge_name: Optional[str] = Field(None, example="Перший крок")

# --- Ендпоінти (3.3 Анотування згідно з MVP Scope) ---

@app.post(
    "/appointments/", 
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Smart Booking: Бронювання слота",
    description="Створює новий запис до лікаря в один клік. Доступно для ролі 'Пацієнт'.",
    tags=["Smart Booking"],
    responses={
        201: {"description": "Візит успішно заброньовано"},
        400: {"description": "Цей слот уже зайнятий або невалідний ID лікаря"}
    }
)
async def create_appointment(appointment: AppointmentBase):
    # Тут логіка збереження в MongoDB (Федорюк Мірча оцінить)
    return {
        "id": "65f1a2b3c4d5",
        "status": "confirmed",
        **appointment.model_dump()
    }

@app.get(
    "/gamification/rewards/{user_id}",
    response_model=RewardPoints,
    summary="Отримання нагород (Gamification Engine)",
    description="Повертає кількість балів та актуальні бейджі користувача для конвертації у знижки.",
    tags=["Gamification Engine"],
    responses={
        200: {"description": "Дані про бали отримано"},
        404: {"description": "Користувача не знайдено"}
    }
)
async def get_user_rewards(user_id: str):
    return {"points": 100, "badge_name": "Перший крок"}

@app.get("/", tags=["General"], summary="Health Check")
def read_root():
    return {"status": "Avyro API is running", "version": "1.0.0"}