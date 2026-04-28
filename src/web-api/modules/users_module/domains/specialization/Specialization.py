from typing import Optional
from bson import ObjectId

class Specialization:
    def __init__(self, name: str, description: str = "", id: Optional[ObjectId] = None):
        self.id = id
        self.name = name
        self.description = description

    @classmethod
    def from_dict(cls, data: dict):
        if not data:
            return None
        return cls(
            id=data.get("_id"),
            name=data.get("name", ""),
            description=data.get("description", "")
        )
