from bson import ObjectId
from pymongo.collection import Collection
from modules.payments_module.domains.Account import Account
from datetime import datetime


class AccountRepository:
    def __init__(self, collection):
        self.collection = collection

    def create(self, account: Account) -> Account:
        data = account.model_dump(by_alias=True, exclude={"id"})
        result = self.collection.insert_one(data)
        account.id = result.inserted_id
        return account

    def find_by_user_id(self, user_id: ObjectId) -> Account | None:
        doc = self.collection.find_one({"user_id": user_id})
        return Account(**doc) if doc else None

    def find_by_stripe_customer_id(self, customer_id: str) -> Account | None:
        doc = self.collection.find_one({"stripe_customer_id": customer_id})
        return Account(**doc) if doc else None

    def update_balance(self, user_id: ObjectId, new_balance: float) -> bool:
        result = self.collection.update_one(
            {"user_id": user_id},
            {"$set": {"balance": new_balance, "updated_at": datetime.utcnow()}},
        )
        return result.modified_count > 0

    def add_card(self, user_id: ObjectId, card: dict) -> bool:
        result = self.collection.update_one(
            {"user_id": user_id},
            {
                "$push": {"cards": card},
                "$set": {"updated_at": datetime.utcnow()},
            },
        )
        return result.modified_count > 0

    def set_pin(self, user_id: ObjectId, hashed_pin: str) -> bool:
        result = self.collection.update_one(
            {"user_id": user_id},
            {"$set": {"pin": hashed_pin, "updated_at": datetime.utcnow()}},
        )
        return result.modified_count > 0

    def deduct_balance(self, user_id: ObjectId, amount: float) -> bool:
        result = self.collection.update_one(
            {
                "user_id": user_id,
                "balance": {"$gte": amount}
            },
            {
                "$inc": {"balance": -amount},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        return result.modified_count > 0
