from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from pymongo.errors import ServerSelectionTimeoutError

from config.db import db
from modules.users_module.api.user_controller import router as user_router
from modules.users_module.api.auth_controller import router as auth_router
from modules.users_module.application.services.UserService import UserService, UserAlreadyExistsException
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository

async def user_already_exists_handler(request: Request, exc: UserAlreadyExistsException):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"message": str(exc)},
    )

async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "Internal server error", "detail": str(exc)},
    )
app = FastAPI(
    title="Avyro — Health Journey API",
    version="1.0.0",
    description="API для гейміфікованої медичної платформи. Система нагород, запис до лікарів та управління візитами.",
    contact={
        "name": "Островський Владислав (Backend Developer)",
    }
)

app.add_exception_handler(UserAlreadyExistsException, user_already_exists_handler)
app.add_exception_handler(Exception, general_exception_handler)


def get_user_service() -> UserService:
    repository = UserRepository(db.users)
    return UserService(repository)
app.dependency_overrides[user_router.dependencies[0] if user_router.dependencies else None] = get_user_service
app.include_router(auth_router)
app.include_router(user_router)

@app.get("/", tags=["General"], summary="Health Check")
def read_root():
    return {
        "status": "Avyro API is running",
        "version": "1.0.0",
        "system": "Healthy"
    }

@app.get("/health/db", tags=["General"])
def db_health():
    try:
        db.command("ping")
        return {"status": "ok", "mongo": "connected"}
    except ServerSelectionTimeoutError:
        return {"status": "error", "mongo": "not connected"}

