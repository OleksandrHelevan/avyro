from bson import ObjectId
from datetime import datetime, timezone
from modules.feedback_module.domains.Feedback import Feedback
from modules.feedback_module.infrastructure.persistence.FeedbackRepository import FeedbackRepository
from modules.feedback_module.application.dto.FeedbackDTOs import CreateFeedbackRequest


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
