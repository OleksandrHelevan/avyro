from config.db import db
from modules.admin_module.application.service.AdminRequestService import AdminRequestService
from modules.requests_module.infrastructure.persistence.RequestRepository import RequestRepository
from modules.appointments_module.infrastructure.persistence.ScheduleRepository import ScheduleRepository
from modules.appointments_module.application.service.ScheduleService import ScheduleService
from modules.appointments_module.application.service.SlotService import SlotService
from modules.users_module.application.services.AuthService import AuthService
from modules.users_module.application.services.DoctorService import DoctorService
from modules.users_module.application.services.PatientService import PatientService
from modules.users_module.application.services.SpecializationService import SpecializationService
from modules.users_module.infrastructure.persistence.RewardRepository import RewardRepository
from modules.users_module.infrastructure.persistence.SpecializationRepository import SpecializationRepository
from modules.users_module.infrastructure.persistence.UserRepository import UserRepository


def get_auth_service() -> AuthService:
    return AuthService(
        user_repository=UserRepository(db["Users"]),
        request_repository=RequestRepository(db["Requests"])
    )


def get_patient_service() -> PatientService:
    return PatientService(
        user_repository=UserRepository(db["Users"]),
        request_repository=RequestRepository(db["Requests"]),
        reward_repository=RewardRepository(db["Rewards"]),
        specialization_repository=SpecializationRepository(db["Specializations"])
    )


def get_doctor_service() -> DoctorService:
    user_repo = UserRepository(db["Users"])
    spec_repo = SpecializationRepository(db["Specializations"])
    schedule_repo = ScheduleRepository(db["Schedules"])

    return DoctorService(
        user_repository=user_repo,
        spec_repository=spec_repo,
        schedule_repository=schedule_repo
    )


def get_schedule_service() -> ScheduleService:
    schedule_repo = ScheduleRepository(db["Schedules"])
    slot_service = SlotService()
    request_repo = RequestRepository(db["Requests"])
    return ScheduleService(schedule_repo, slot_service, request_repo)


def get_specialization_service() -> SpecializationService:
    repo = SpecializationRepository(db["Specializations"])
    request_repo = RequestRepository(db["Requests"])
    return SpecializationService(repo, request_repo)


def get_admin_request_service() -> AdminRequestService:
    request_repo = RequestRepository(db["Requests"])
    user_repo = UserRepository(db["Users"])
    reward_repo = RewardRepository(db["Rewards"])

    schedule_service = get_schedule_service()
    spec_service = get_specialization_service()

    user_service = get_patient_service()

    return AdminRequestService(
        request_repo=request_repo,
        user_service=user_service,
        schedule_service=schedule_service,
        specialization_service=spec_service
    )
