from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import date, time, datetime
from typing import Optional, List

# 1. Schema rút gọn cho User (Sửa lỗi dict_type)
class UserShortResponse(BaseModel):
    id: int
    full_name: Optional[str] = None
    email: EmailStr
    role: str
    
    model_config = ConfigDict(from_attributes=True)

# 2. Schema rút gọn cho Restaurant
class RestaurantShortResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    image_urls: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)

# 3. Schema cơ sở cho Booking
class RestBookingBase(BaseModel):
    restaurant_id: int
    guest_full_name: str
    guest_email: EmailStr
    guest_phone: str
    booking_date: date
    booking_time: time
    guests: int
    special_request: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class RestBookingCreate(RestBookingBase):
    pass

class RestBookingResponse(RestBookingBase):
    id: int
    user_id: int
    status: str
    created_at: datetime

# 4. Schema dành cho User xem lịch sử
class MyRestBookingResponse(RestBookingResponse):
    restaurant: Optional[RestaurantShortResponse] = None 

# 5. Schema dành cho Admin/Chi tiết (Sửa lỗi ở đây)
class AdminRestBookingResponse(RestBookingResponse):
    restaurant: Optional[RestaurantShortResponse] = None
    # Thay 'dict' bằng Schema thực tế
    user: Optional[UserShortResponse] = None