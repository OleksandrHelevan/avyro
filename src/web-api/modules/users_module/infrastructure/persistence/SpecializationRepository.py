from typing import Optional, List
from bson import ObjectId
from pymongo.collection import Collection
from datetime import datetime, timezone  # <- ДОДАНО ІМПОРТ

from modules.users_module.domains.specialization.Specialization import Specialization

class SpecializationRepository:
    def __init__(self, collection: Collection):
        self.collection = collection

    def get_by_id(self, spec_id: ObjectId) -> Optional[Specialization]:
        doc = self.collection.find_one({"_id": spec_id})
        if not doc:
            return None
        return Specialization.from_dict(doc)

    def get_all(self) -> List[Specialization]:
        cursor = self.collection.find()
        return [Specialization.from_dict(doc) for doc in cursor]

    def create(self, spec: Specialization) -> Specialization:
        # ДОДАНО ПОЛЕ createdAt
        result = self.collection.insert_one({
            "name": spec.name,
            "description": spec.description,
            "createdAt": datetime.now(timezone.utc)  # Додаємо час створення
        })
        spec.id = result.inserted_id
        return spec

    def get_by_name(self, name: str):
        # case-insensitive пошук (регістронезалежний), щоб уникнути дублікатів типу "хірург" і "Хірург"
        return self.collection.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
