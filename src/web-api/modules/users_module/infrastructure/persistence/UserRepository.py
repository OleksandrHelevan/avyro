from datetime import datetime, timezone
from bson import ObjectId
from pymongo.collection import Collection
from modules.users_module.domains.user.User import User
from typing import Optional, Any, Dict


class UserRepository:
    def __init__(self, collection: Collection):
        self.collection = collection

    def create(self, user: User) -> User:
        data = user.to_dict()
        result = self.collection.insert_one(data)
        user.id = result.inserted_id
        return user

    def get_by_id(self, user_id: ObjectId) -> Optional[User]:
        doc = self.collection.find_one({"_id": user_id})
        if not doc:
            return None
        return User.from_dict(doc)

    def get_by_email(self, email: str) -> Optional[User]:
        doc = self.collection.find_one({"email": email})
        if not doc:
            return None
        return User.from_dict(doc)

    def update_profile(self, user_id: ObjectId, profile: dict) -> None:
        self.collection.update_one(
            {"_id": user_id},
            {
                "$set": {
                    "profile": profile,
                    "updatedAt": datetime.now(timezone.utc)
                }
            }
        )

    def update_last_login(self, user_id: ObjectId, login_time: datetime):
        self.collection.update_one(
            {"_id": user_id},
            {"$set": {"lastLoginAt": login_time}}
        )

    def get_doctors(self, specialization_id: str = None) -> list:
        query: Dict[str, Any] = {"role": "DOCTOR"}

        if specialization_id:
            try:
                query["profile.specialization_id"] = ObjectId(specialization_id)
            except Exception:
                return []

        cursor = self.collection.find(query)

        return [User.from_dict(doc) for doc in cursor]
