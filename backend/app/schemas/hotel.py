from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class HotelBase(BaseModel):
    region_id: int
    name: str

    map_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None

    price_per_night: Optional[int] = None
    rating: Optional[float] = None

    image_urls: Optional[List[str]] = []
    tags: Optional[List[str]] = []

    is_active: Optional[bool] = True


class HotelCreate(HotelBase):
    pass


class HotelUpdate(BaseModel):
    region_id: Optional[int] = None
    name: Optional[str] = None

    map_url: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None

    price_per_night: Optional[int] = None
    rating: Optional[float] = None

    image_urls: Optional[List[str]] = None
    tags: Optional[List[str]] = None

    is_active: Optional[bool] = None


class HotelResponse(HotelBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
