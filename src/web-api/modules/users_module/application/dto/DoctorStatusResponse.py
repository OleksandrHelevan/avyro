from pydantic import BaseModel

class DoctorStatusResponse(BaseModel):
    isAuthenticated: bool
    isPending: bool
