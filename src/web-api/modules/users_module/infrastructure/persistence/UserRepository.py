from typing import Optional, List
from bson import ObjectId
from pymongo.collection import Collection

from modules.users_module.domains.user.User import User


class UserRepository:
    def __init__(self, collection: Collection):
        self.collection = collection

    def create(self, user: User) -> User:
        data = user.to_dict()
        result = self.collection.insert_one(data)
        user.id = result.inserted_id

        return user

    def get_by_id(self, user_id: str) -> Optional[User]:
        doc = self.collection.find_one({"_id": ObjectId(user_id)})
        if not doc:
            return None
        return User.from_dict(doc)

    def get_by_email(self, email: str) -> Optional[User]:
        doc = self.collection.find_one({"email": email})
        if not doc:
            return None
        return User.from_dict(doc)

    def get_all(self) -> List[User]:
        docs = self.collection.find()
        return [User.from_dict(doc) for doc in docs]

    def update(self, user: User) -> bool:
        if not user.id:
            return False

        data = user.to_dict()
        user_id = data.pop("_id")

        result = self.collection.update_one(
            {"_id": user_id},
            {"$set": data}
        )

        return result.modified_count > 0

    def soft_delete(self, user_id: str) -> bool:
        from datetime import datetime

        result = self.collection.update_one(
            {"_id": ObjectId(user_id)},
            {
                "$set": {
                    "deletedAt": datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    def delete(self, user_id: str) -> bool:
        result = self.collection.delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0
