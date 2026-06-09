from bson import ObjectId
from datetime import datetime
from modules.feedback_module.domains.Feedback import Feedback
from modules.feedback_module.domains.DoctorReview import DoctorReview


class FeedbackRepository:
    def __init__(self, collection):
        self.collection = collection

    def create(self, feedback: Feedback) -> Feedback:
        data = {
            "user_id": feedback.user_id,
            "message": feedback.message,
            "rating": feedback.rating,
            "created_at": feedback.created_at,
        }
        result = self.collection.insert_one(data)
        feedback.id = result.inserted_id
        return feedback

    def get_all(self) -> list:
        return list(self.collection.find().sort("created_at", -1))

    def create_review(self, review: DoctorReview) -> DoctorReview:
        data = {
            "doctor_id": review.doctor_id,
            "patient_id": review.patient_id,
            "message": review.message,
            "rating": review.rating,
            "visibility": review.visibility.value,
            "created_at": review.created_at,
        }
        result = self.collection_reviews.insert_one(data)
        review.id = result.inserted_id
        return review

    def get_reviews_by_doctor_id(self, doctor_id: ObjectId) -> list:
        return list(self.collection_reviews.find(
            {"doctor_id": doctor_id}
        ).sort("created_at", -1))
