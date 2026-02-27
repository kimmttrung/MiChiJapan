# app/schemas/destinations.py
from pydantic import BaseModel
from typing import List, Optional
from .hotel import HotelResponse
from .restaurant import RestaurantResponse
from .place import PlaceResponse

class DestinationDetail(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    # Kết nối các schema bạn đã gửi
    hotels: List[HotelResponse] = []
    restaurants: List[RestaurantResponse] = []
    spots: List[PlaceResponse] = [] # Trong model Region bạn đặt tên là 'spots'

    class Config:
        from_attributes = True