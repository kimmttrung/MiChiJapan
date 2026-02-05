from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.restaurant import Cuisine
from app.schemas.cuisine import CuisineCreate, CuisineUpdate, CuisineResponse

router = APIRouter()

# GET ALL
@router.get("/cuisines", response_model=list[CuisineResponse])
async def get_cuisines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cuisine).order_by(Cuisine.id))
    return result.scalars().all()

# CREATE
@router.post("/cuisines", response_model=CuisineResponse)
async def create_cuisine(item: CuisineCreate, db: AsyncSession = Depends(get_db)):
    # Check trùng tên
    existing = await db.execute(select(Cuisine).where(Cuisine.name == item.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Loại ẩm thực này đã tồn tại")

    new_cuisine = Cuisine(name=item.name)
    db.add(new_cuisine)
    await db.commit()
    await db.refresh(new_cuisine)
    return new_cuisine

# UPDATE
@router.put("/cuisines/{id}", response_model=CuisineResponse)
async def update_cuisine(id: int, item: CuisineUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cuisine).where(Cuisine.id == id))
    cuisine = result.scalar_one_or_none()
    if not cuisine:
        raise HTTPException(404, "Not found")

    cuisine.name = item.name
    await db.commit()
    await db.refresh(cuisine)
    return cuisine

# DELETE
@router.delete("/cuisines/{id}")
async def delete_cuisine(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cuisine).where(Cuisine.id == id))
    cuisine = result.scalar_one_or_none()
    if not cuisine:
        raise HTTPException(404, "Not found")

    await db.delete(cuisine)
    await db.commit()
    return {"message": "Deleted"}