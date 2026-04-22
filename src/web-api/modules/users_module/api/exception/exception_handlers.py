from config.logging_config import logger
from datetime import datetime, timezone
from fastapi import Request, status
from fastapi.responses import JSONResponse

from modules.users_module.api.exception.exceptions import (
    UserAlreadyExistsException,
    UserNotFoundException,
    InvalidUserIdException,
    ForbiddenException,
    InvalidCredentialsException
)

async def user_already_exists_handler(request: Request, exc: UserAlreadyExistsException):
    logger.warning(f"User already exists: {str(exc)} | Path: {request.url.path} | Method: {request.method}")
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "errorCode": "USER_ALREADY_EXISTS",
            "message": str(exc)
        },
    )

async def invalid_credentials_handler(request: Request, exc: InvalidCredentialsException):
    logger.warning(f"Invalid credentials attempt: {str(exc)} | Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_401_UNAUTHORIZED,
        content={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "errorCode": "INVALID_CREDENTIALS",
            "message": str(exc)
        },
    )

async def user_not_found_handler(request: Request, exc: UserNotFoundException):
    logger.warning(f"User not found: {str(exc)} | Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "errorCode": "USER_NOT_FOUND",
            "message": str(exc)
        },
    )

async def invalid_user_id_handler(request: Request, exc: InvalidUserIdException):
    logger.warning(f"Invalid User ID provided: {str(exc)} | Path: {request.url.path}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "errorCode": "INVALID_USER_ID",
            "message": str(exc)
        },
    )

async def forbidden_handler(request: Request, exc: ForbiddenException):
    logger.error(f"Access forbidden: {str(exc)} | Path: {request.url.path} | Client IP: {request.client.host if request.client else 'unknown'}")
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "errorCode": "FORBIDDEN",
            "message": str(exc)
        },
    )

async def general_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"UNEXPECTED CRASH: {str(exc)} | Path: {request.url.path} | Method: {request.method}",
        exc_info=True
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "errorCode": "INTERNAL_ERROR",
            "message": "An unexpected error occurred"
        },
    )
