from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, hash_password
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest

router = APIRouter()

@router.post("/login")
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    # 1. Tìm user theo email
    result = await db.execute(select(User).filter(User.email == data.email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(status_code=400, detail="Email không tồn tại")

    # 2. Kiểm tra mật khẩu
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Mật khẩu không chính xác")

    # 3. Tạo Token
    token = create_access_token({"sub": user.email, "role": user.role})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "avatar_url": user.avatar_url
        }
    }

@router.post("/register")
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check trùng email
    check_user = await db.execute(select(User).filter(User.email == data.email))
    if check_user.scalars().first():
        raise HTTPException(status_code=400, detail="Email đã được sử dụng")

    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name
    )
    db.add(new_user)
    await db.commit()
    return {"message": "Đăng ký thành công"}