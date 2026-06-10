from bson import ObjectId
from datetime import datetime, timezone
from modules.feedback_module.domains.Feedback import Feedback
from modules.feedback_module.infrastructure.persistence.FeedbackRepository import FeedbackRepository
from modules.feedback_module.application.dto.FeedbackDTOs import CreateFeedbackRequest
from modules.feedback_module.domains.DoctorReview import DoctorReview, ReviewVisibility
from modules.feedback_module.application.dto.FeedbackDTOs import CreateDoctorReviewRequest

class FeedbackService:
    def __init__(self, feedback_repo: FeedbackRepository, user_repository):
        self.feedback_repo = feedback_repo
        self.user_repository = user_repository


    def create_feedback(self, user_id: str, dto: CreateFeedbackRequest) -> dict:
        feedback = Feedback(
            user_id=ObjectId(user_id),
            message=dto.message,
            rating=dto.rating,
            created_at=datetime.now(timezone.utc),
        )
        created = self.feedback_repo.create(feedback)
        return {"feedback_id": str(created.id), "status": "ok"}

    def get_all_feedback(self) -> list:
        docs = self.feedback_repo.get_all()
        result = []
        for doc in docs:
            user = self.user_repository.find_by_id(doc["user_id"])
            result.append({
                "feedback_id": str(doc["_id"]),
                "message": doc["message"],
                "rating": doc.get("rating"),
                "created_at": doc["created_at"].isoformat() if hasattr(doc["created_at"], "isoformat") else doc["created_at"],
                "user": {
                    "id": str(doc["user_id"]),
                    "name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip() if user else "Невідомий",
                    "role": user.role.value if user and hasattr(user.role, "value") else getattr(user, "role", "UNKNOWN") if user else "UNKNOWN",
                    "avatar_url": getattr(user, "avatar_url", None) if user else None,
                } if user else None,
            })
        return result

    def create_doctor_review(self, patient_id: str, dto: CreateDoctorReviewRequest) -> dict:
        review = DoctorReview(
            doctor_id=ObjectId(dto.doctor_id),
            patient_id=ObjectId(patient_id),
            message=dto.message,
            rating=dto.rating,
            visibility=ReviewVisibility(dto.visibility),
            created_at=datetime.now(timezone.utc),
        )
        created = self.feedback_repo.create_review(review)
        return {"review_id": str(created.id), "status": "ok"}

    def get_doctor_reviews(self, doctor_id: str) -> list:
        docs = self.feedback_repo.get_reviews_by_doctor_id(ObjectId(doctor_id))
        result = []
        for doc in docs:
            is_public = doc.get("visibility") == "PUBLIC"
            user = self.user_repository.find_by_id(doc["patient_id"]) if is_public else None
            result.append({
                "review_id": str(doc["_id"]),
                "message": doc["message"],
                "rating": doc["rating"],
                "visibility": doc["visibility"],
                "created_at": doc["created_at"].isoformat() if hasattr(doc["created_at"], "isoformat") else doc[
                    "created_at"],
                "author": {
                    "name": f"{getattr(user, 'first_name', '')} {getattr(user, 'last_name', '')}".strip(),
                    "avatar_url": getattr(user, "avatar_url", None),
                } if is_public and user else None,
            })
        return result

