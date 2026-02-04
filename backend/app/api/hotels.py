from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import json

from app.core.database import get_db
from app.models.hotel import Hotel
from app.schemas.hotel import HotelCreate, HotelUpdate
from app.models.region import Region

router = APIRouter()

# =========================
# GET ALL
# =========================
@router.get("/hotels/{hotel_id}")
async def get_hotel(
    hotel_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Hotel).where(Hotel.id == hotel_id)
    )
    hotel = result.scalar_one_or_none()
    return hotel

@router.get("/hotels")
async def get_hotels(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Hotel, Region.name.label("region_name"))
        .join(Region, Hotel.region_id == Region.id)
    )

    rows = result.all()

    return [
        {
            **hotel.__dict__,
            "region_name": region_name
        }
        for hotel, region_name in rows
    ]
# =========================
# CREATE
# =========================
@router.post("/hotels")
async def create_hotel(
    hotel_in: HotelCreate,
    db: AsyncSession = Depends(get_db)
):
    hotel = Hotel(
        **hotel_in.model_dump(
            exclude={"image_urls", "tags"}
        ),
        image_urls=hotel_in.image_urls or [],
        tags=hotel_in.tags or []
    )

    db.add(hotel)
    await db.commit()
    await db.refresh(hotel)

    return {"message": "Tạo khách sạn thành công", "id": hotel.id}

# =========================
# UPDATE
# =========================
@router.put("/hotels/{hotel_id}")
async def update_hotel(
    hotel_id: int,
    hotel_in: HotelUpdate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Hotel).where(Hotel.id == hotel_id)
    )
    hotel = result.scalars().first()

    if not hotel:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách sạn")

    data = hotel_in.model_dump(exclude_unset=True)

    if "image_urls" in data:
        hotel.image_urls = data["image_urls"]

    if "tags" in data:
        hotel.tags = data["tags"]

    for k, v in data.items():
        setattr(hotel, k, v)

    await db.commit()
    await db.refresh(hotel)

    return {"message": "Cập nhật thành công"}


# =========================
# DELETE
# =========================
@router.delete("/hotels/{hotel_id}")
async def delete_hotel(
    hotel_id: int,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Hotel).where(Hotel.id == hotel_id)
    )
    hotel = result.scalars().first()

    if not hotel:
        raise HTTPException(status_code=404, detail="Không tìm thấy khách sạn")

    await db.delete(hotel)
    await db.commit()

    return {"message": "Đã xóa khách sạn"}
