# app/api/admin/place.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models.place import Place
from app.schemas.place import PlaceCreate, PlaceUpdate, PlaceResponse

router = APIRouter(prefix="/places", tags=["Places"])

# =========================
# GET ALL
# =========================
@router.get("", response_model=list[PlaceResponse])
async def get_places(
    region_id: int | None = None,
    place_type: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Place)

    if region_id:
        query = query.where(Place.region_id == region_id)
    if place_type:
        query = query.where(Place.place_type == place_type)

    result = await db.execute(query.order_by(Place.id.desc()))
    return result.scalars().all()

# =========================
# GET DETAIL
# =========================
@router.get("/{id}", response_model=PlaceResponse)
async def get_place(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Place).where(Place.id == id))
    place = result.scalar_one_or_none()
    if not place:
        raise HTTPException(404, "Place not found")
    return place

# =========================
# CREATE
# =========================
@router.post("", response_model=PlaceResponse)
async def create_place(item: PlaceCreate, db: AsyncSession = Depends(get_db)):
    place = Place(**item.model_dump())
    db.add(place)
    await db.commit()
    await db.refresh(place)
    return place

# =========================
# UPDATE
# =========================
@router.put("/{id}", response_model=PlaceResponse)
async def update_place(id: int, item: PlaceUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Place).where(Place.id == id))
    place = result.scalar_one_or_none()
    if not place:
        raise HTTPException(404, "Place not found")

    for k, v in item.model_dump().items():
        setattr(place, k, v)

    await db.commit()
    await db.refresh(place)
    return place

# =========================
# DELETE
# =========================
@router.delete("/{id}")
async def delete_place(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Place).where(Place.id == id))
    place = result.scalar_one_or_none()
    if not place:
        raise HTTPException(404, "Place not found")

    await db.delete(place)
    await db.commit()
    return {"message": "Deleted"}
