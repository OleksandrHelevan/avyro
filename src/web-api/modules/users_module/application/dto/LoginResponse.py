from pydantic import BaseModel

class LoginResponse(BaseModel):
    accessToken: str
    tokenType: str = "bearer"
    role: str
    expiresAt: int
    userId: str
