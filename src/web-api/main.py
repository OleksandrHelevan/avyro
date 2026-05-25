import time
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pymongo.errors import ServerSelectionTimeoutError
from starlette.middleware.base import BaseHTTPMiddleware

from modules.users_module.api.DoctorController import router as doctor_router

from config.db import db
from config.logging_config import logger
from modules.users_module.api.PatientController import router as user_router
from modules.users_module.api.AuthController import router as auth_router
from modules.appointments_module.api.ScheduleController import router as schedule_router
from modules.users_module.api.SpecializationController import router as specialization_router
from modules.admin_module.api.AdminController import router as admin_router
from modules.appointments_module.application.service.SlotCleanerScheduler import start_slot_cleaner
from modules.notifications_module.api.NotificationController import router as notification_router

from modules.payments_module.api.PaymentController import router as payment_router
from modules.payments_module.api.WebhookController import router as webhook_router



from contextlib import asynccontextmanager
from fastapi import FastAPI






from modules.users_module.api.exception.exception_handlers import (
    forbidden_handler,
    invalid_user_id_handler,
    user_not_found_handler,
    user_already_exists_handler,
    invalid_credentials_handler,
    general_exception_handler
)

from modules.users_module.api.exception.exceptions import (
    UserAlreadyExistsException,
    UserNotFoundException,
    InvalidUserIdException,
    ForbiddenException,
    InvalidCredentialsException
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    start_slot_cleaner()
    yield

app = FastAPI(
    lifespan=lifespan,
    title="Avyro — Health Journey API",
    version="1.0.0",
    description=(
        "API для гейміфікованої медичної платформи. "
        "Система нагород, запис до лікарів та управління візитами."
    ),
    contact={
        "name": "Avyro team",
    }
)

async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = round(time.time() - start_time, 4)

    logger.info(
        f"Method: {request.method} | Path: {request.url.path} | "
        f"Status: {response.status_code} | Time: {process_time}s"
    )
    return response


app.add_middleware(BaseHTTPMiddleware, dispatch=logging_middleware)

app.add_exception_handler(UserAlreadyExistsException, user_already_exists_handler)
app.add_exception_handler(UserNotFoundException, user_not_found_handler)
app.add_exception_handler(InvalidUserIdException, invalid_user_id_handler)
app.add_exception_handler(ForbiddenException, forbidden_handler)
app.add_exception_handler(InvalidCredentialsException, invalid_credentials_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.include_router(admin_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(doctor_router)
app.include_router(specialization_router)
app.include_router(schedule_router)
app.include_router(notification_router)
app.include_router(payment_router)
app.include_router(webhook_router)

@app.get("/health", tags=["General"], summary="Health Status")
def db_health():
    try:
        db.command("ping")
        return {"status": "Avyro API is running", "version": "0.1", "mongo": "connected"}
    except (ServerSelectionTimeoutError, Exception) as e:
        logger.critical(f"Database health check failed: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "mongo": "not connected", "message": "Database is offline"}
        )
from modules.appointments_module.api.AppointmentController import router as appointment_router
app.include_router(appointment_router)
