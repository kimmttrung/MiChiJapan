from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- CUISINE (Loại ẩm thực) ---
class CuisineBase(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

# --- RESTAURANT CUISINE (Chi tiết món ăn trong nhà hàng) ---
class RestaurantCuisineDTO(BaseModel):
    cuisine_id: int
    description: Optional[str] = None
    average_price: Optional[int] = 0
    price_range: Optional[str] = None
    is_available: Optional[bool] = True
    image_url: Optional[str] = None

class RestaurantCuisineResponse(RestaurantCuisineDTO):
    id: Optional[int] = None
    cuisine_name: str  # Để hiển thị tên món (VD: Sushi) thay vì ID
    class Config:
        from_attributes = True

# --- RESTAURANT (Nhà hàng) ---
class RestaurantBase(BaseModel):
    region_id: int
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    map_url: Optional[str] = None
    rating: Optional[float] = None
    image_urls: List[str] = []
    tags: List[str] = []
    is_active: Optional[bool] = True

class RestaurantCreate(RestaurantBase):
    # Khi tạo/sửa nhà hàng, gửi kèm danh sách các ẩm thực
    cuisines: List[RestaurantCuisineDTO] = []

class RestaurantUpdate(RestaurantBase):
    cuisines: List[RestaurantCuisineDTO] = []

class RestaurantResponse(RestaurantBase):
    id: int
    created_at: datetime
    region_name: Optional[str] = None
    # Trả về danh sách ẩm thực chi tiết
    cuisines_data: List[RestaurantCuisineResponse] = []

    class Config:
        from_attributes = True