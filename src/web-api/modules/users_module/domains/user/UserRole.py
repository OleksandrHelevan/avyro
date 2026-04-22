from enum import Enum

class UserRole(str, Enum):
    DOCTOR = "DOCTOR"
    ADMIN = "ADMIN"
    PATIENT = "PATIENT"
