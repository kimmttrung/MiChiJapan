# app/api/admin.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.user import User
from app.core.security import hash_password

router = APIRouter()

@router.post("/create-admin")
async def create_admin(db: AsyncSession = Depends(get_db)):
    email = "admin@gmail.com"

    # check tồn tại
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        return {"message": "Admin already exists"}

    admin = User(
        email=email,
        password_hash=hash_password("123456"),
        full_name="MichiJapan",
        role="admin",
        is_verified=True
    )

    db.add(admin)
    await db.commit()
    await db.refresh(admin)

    return {
        "id": admin.id,
        "email": admin.email,
        "role": admin.role
    }
