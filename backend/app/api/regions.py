from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.region import Region
from app.schemas.region import RegionCreate, RegionUpdate

router = APIRouter()

@router.get("/regions")
async def get_regions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Region).order_by(Region.id.desc()))
    return result.scalars().all()

@router.post("/regions")
async def create_region(data: RegionCreate, db: AsyncSession = Depends(get_db)):
    region = Region(**data.model_dump())
    db.add(region)
    await db.commit()
    await db.refresh(region)
    return region

@router.put("/regions/{region_id}")
async def update_region(region_id: int, data: RegionUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Region).where(Region.id == region_id))
    region = result.scalars().first()

    if not region:
        raise HTTPException(status_code=404, detail="Không tìm thấy vùng")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(region, field, value)

    await db.commit()
    return {"message": "Cập nhật thành công"}

@router.delete("/regions/{region_id}")
async def delete_region(region_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Region).where(Region.id == region_id))
    region = result.scalars().first()

    if not region:
        raise HTTPException(status_code=404, detail="Không tìm thấy vùng")

    await db.delete(region)
    await db.commit()
    return {"message": "Xóa vùng thành công"}
