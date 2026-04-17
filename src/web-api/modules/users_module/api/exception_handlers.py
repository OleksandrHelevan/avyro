from fastapi import Request, status
from fastapi.responses import JSONResponse
from modules.users_module.application.services.UserService import UserAlreadyExistsException

async def user_already_exists_handler(request: Request, exc: UserAlreadyExistsException):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"message": str(exc)},
    )

async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"message": "An unexpected error occurred", "detail": str(exc)},
    )
