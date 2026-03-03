from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional, List

# --- CREATE ---
class BookingCreate(BaseModel):
    hotel_id: int
    check_in: date
    check_out: date
    guests: int
    guest_full_name: Optional[str] = None
    guest_email: Optional[EmailStr] = None
    guest_phone: Optional[str] = None
    special_request: Optional[str] = None

    @field_validator("check_out")
    @classmethod
    def validate_date_range(cls, v, info):
        check_in = info.data.get("check_in")
        if check_in and v <= check_in:
            raise ValueError("check_out must be after check_in")
        return v

    @field_validator("guests")
    @classmethod
    def validate_guests(cls, v):
        if v <= 0:
            raise ValueError("guests must be greater than 0")
        return v

# --- SHARED RESPONSES ---
class HotelShortResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    map_url: Optional[str] = None
    address: Optional[str] = None # Thêm address để hiện ở Detail
    image_urls: Optional[List[str]] = None

    class Config:
        from_attributes = True

class UserShortResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True

# --- BOOKING RESPONSES ---
class BookingResponse(BaseModel):
    id: int
    hotel_id: int
    check_in: date
    check_out: date
    guests: int
    total_nights: int
    total_amount: int
    status: str
    
    # Bổ sung các trường thông tin khách để xem Detail
    guest_full_name: Optional[str] = None
    guest_phone: Optional[str] = None
    guest_email: Optional[str] = None
    special_request: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class MyBookingResponse(BookingResponse):
    hotel: HotelShortResponse

class AdminBookingResponse(MyBookingResponse):
    user: Optional[UserShortResponse] = None