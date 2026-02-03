from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base Schema: Chứa các trường chung
class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = "user"
    is_verified: Optional[bool] = False

# Schema dùng cho Input khi tạo mới (POST)
class UserCreate(UserBase):
    password: str 

# Schema dùng cho Input khi cập nhật (PUT)
# Tất cả các trường đều là Optional vì người dùng có thể chỉ sửa 1 trường
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None
    is_verified: Optional[bool] = None
    # Không cho phép update email hoặc password ở API này (thường làm API riêng)

# Schema dùng cho Output trả về (Response)
class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    created_at: datetime  # Pydantic sẽ tự serialize datetime

    class Config:
        from_attributes = True  # Để đọc dữ liệu từ SQLAlchemy Object