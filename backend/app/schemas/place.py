# app/schemas/place.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PlaceBase(BaseModel):
    region_id: int
    name: str
    place_type: str

    description: Optional[str] = None
    address: Optional[str] = None
    map_url: Optional[str] = None

    average_price: Optional[int] = None
    price_range: Optional[str] = None

    rating: Optional[float] = None
    image_urls: List[str] = []
    tags: List[str] = []

    is_active: bool = True

class PlaceCreate(PlaceBase):
    pass

class PlaceUpdate(PlaceBase):
    pass

class PlaceResponse(PlaceBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
