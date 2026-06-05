from typing import List
from bson import ObjectId
from pymongo.collection import Collection
from modules.users_module.domains.reward.Reward import Reward, RewardSource, RewardType
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
        count = self.collection.count_documents({
            "patientId": patient_id,
            "source.type": RewardSource.PROFILE_BONUS.value
        })
        return count > 0

    def get_all_by_patient_id(self, patient_id: ObjectId) -> list:

        rewards = self.collection.find({"user_id": patient_id})
        return list(rewards)

    def has_first_visit_bonus(self, patient_id: ObjectId) -> bool:
        count = self.collection.count_documents({
            "patientId": patient_id,
            "source.type": RewardSource.FIRST_VISIT_BONUS.value
        })
        return count > 0

    def get_total_points(self, patient_id: ObjectId) -> int:
        pipeline = [
            {"$match": {"patientId": patient_id}},
            {"$group": {"_id": None, "total": {"$sum": "$points"}}}
        ]
        result = list(self.collection.aggregate(pipeline))
        return max(result[0]["total"] if result else 0, 0)

    def spend_points(self, patient_id: ObjectId, points: int, description: str) -> None:
        reward = Reward(
            patientId=patient_id,
            type=RewardType.SPEND,
            points=-points,
            source=RewardSource.APPOINTMENT_PAYMENT,
            description=description
        )
        self.create(reward)



