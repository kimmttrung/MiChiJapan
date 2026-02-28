from pydantic import BaseModel, EmailStr, field_validator
from datetime import date
from typing import Optional


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

class BookingResponse(BaseModel):
    id: int
    hotel_id: int
    check_in: date
    check_out: date
    guests: int
    total_nights: int
    total_amount: int
    status: str

    class Config:
        from_attributes = True

from typing import List
from datetime import date, datetime


class HotelShortResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    map_url: Optional[str]
    image_urls: Optional[List[str]]

    class Config:
        from_attributes = True


class MyBookingResponse(BaseModel):
    id: int
    check_in: date
    check_out: date
    guests: int
    total_nights: int
    total_amount: int
    status: str
    created_at: datetime

    hotel: HotelShortResponse

    class Config:
        from_attributes = True

class UserShortResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str]
    address: Optional[str]
    avatar_url: Optional[str]

    class Config:
        from_attributes = True

class AdminBookingResponse(MyBookingResponse):
    # Thêm trường user vào đây
    user: Optional[UserShortResponse] 

    class Config:
        from_attributes = True