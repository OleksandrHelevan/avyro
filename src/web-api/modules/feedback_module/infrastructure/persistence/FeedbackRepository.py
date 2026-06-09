from bson import ObjectId
from datetime import datetime
from modules.feedback_module.domains.Feedback import Feedback


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
