from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship

class Location(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    region: str  # VD: "Da Nang", "Ha Noi"
    type: str    # "resort", "hotel", "restaurant", "activity"
    description: str
    price_level: str # "budget", "luxury"
    price_avg: float
    rating: float
    address: str