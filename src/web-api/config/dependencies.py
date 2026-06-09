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
from modules.appointments_module.infrastructure.persistence.AppointmentRepository import AppointmentRepository
from modules.appointments_module.application.service.AppointmentService import AppointmentService
from modules.payments_module.infrastructure.persistence.AccountRepository import AccountRepository
from modules.payments_module.application.AccountService import AccountService
from modules.payments_module.application.StripeService import StripeService
from modules.appointments_module.infrastructure.persistence.SlotRepository import SlotRepository
from modules.feedback_module.application.FeedbackService import FeedbackService
from modules.feedback_module.infrastructure.persistence.FeedbackRepository import FeedbackRepository






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

def get_account_service() -> AccountService:
    return AccountService(
        account_repo=AccountRepository(db["Accounts"]),
        stripe_service=StripeService()
    )


def get_appointment_service() -> AppointmentService:
    from modules.notifications_module.application.service.NotificationService import NotificationService

    appointment_repo = AppointmentRepository(db["Appointments"])
    schedule_repo = ScheduleRepository(db["Schedules"])
    slot_repo = SlotRepository(db["Schedules"])
    account_service = AccountService(
        account_repo=AccountRepository(db["Accounts"]),
        stripe_service=StripeService()
    )
    reward_repo = RewardRepository(db["Rewards"])
    notification_service = NotificationService()
    user_repo = UserRepository(db["Users"])

    return AppointmentService(
        appointment_repository=appointment_repo,
        schedule_repository=schedule_repo,
        slot_repository=slot_repo,
        account_service=account_service,
        reward_repository=reward_repo,       # ← було пропущено
        notification_service=notification_service,
        user_repository=user_repo,
    )

def get_feedback_service() -> FeedbackService:
    user_repo = UserRepository(db["Users"])
    repo = FeedbackRepository(db["Feedbacks"])
    return FeedbackService(repo, user_repo)





