from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.models.user import User
# Import các schema đã tách
from app.schemas.user import UserCreate, UserUpdate, UserResponse
# Import hàm hash_password từ file security.py của bạn
from app.core.security import hash_password

router = APIRouter()

# 1. GET: Lấy danh sách
@router.get("/users")
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.id.desc()))
    users = result.scalars().all()
    
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "phone": u.phone, 
            "role": u.role,
            "is_verified": u.is_verified,
            "created_at": u.created_at.strftime("%Y-%m-%d") if u.created_at else None,
            "avatar_url": u.avatar_url
        }
        for u in users
    ]

# 2. POST: Thêm mới user (Đã cập nhật hash password)
@router.post("/users")
async def create_user(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Kiểm tra email tồn tại
    existing_user = await db.execute(select(User).where(User.email == user_in.email))
    if existing_user.scalars().first():
        raise HTTPException(status_code=400, detail="Email này đã được đăng ký")

    # --- SỬ DỤNG HÀM TỪ SECURITY.PY ---
    hashed_pwd = hash_password(user_in.password)
    
    # Tạo user mới
    new_user = User(
        email=user_in.email,
        password_hash=hashed_pwd, # Lưu mật khẩu đã băm
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role,
        is_verified=user_in.is_verified
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return {"message": "Tạo người dùng thành công", "id": new_user.id}

# 3. PUT: Cập nhật thông tin user
@router.put("/users/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    update_data = user_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)

    return {"message": "Cập nhật thành công"}

# 4. DELETE: Xóa user
@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")
    
    await db.delete(user)
    await db.commit()
    return {"message": "Xóa người dùng thành công"}