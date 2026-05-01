from typing import List
from bson import ObjectId
from pymongo.collection import Collection
from modules.users_module.domains.reward.Reward import Reward, RewardSource

class RewardRepository:
    def __init__(self, collection: Collection):
        self.collection = collection

    def create(self, reward: Reward) -> Reward:
        result = self.collection.insert_one(reward.to_dict())
        reward.id = result.inserted_id
        return reward

    def get_by_patient_id(self, patient_id: ObjectId) -> List[Reward]:
        cursor = self.collection.find({"patientId": patient_id})
        return [Reward.from_dict(doc) for doc in cursor]

    def has_profile_bonus(self, patient_id: ObjectId) -> bool:
        # Перевіряє, чи юзер вже отримував нагороду PROFILE_BONUS
        count = self.collection.count_documents({
            "patientId": patient_id,
            "source.type": RewardSource.PROFILE_BONUS.value  # <--- ЗМІНА ТУТ: тепер шукаємо source.type
        })
        return count > 0




