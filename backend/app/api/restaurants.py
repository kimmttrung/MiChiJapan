from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.restaurant import Restaurant, RestaurantCuisine, Cuisine
from app.models.region import Region
from app.schemas.restaurant import RestaurantCreate, RestaurantUpdate

router = APIRouter()

# --- HELPER: Lấy danh sách Loại ẩm thực (để hiện Dropdown) ---
@router.get("/cuisines")
async def get_all_cuisines(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cuisine))
    return result.scalars().all()

# --- GET ALL RESTAURANTS ---
@router.get("/restaurants")
async def get_restaurants(db: AsyncSession = Depends(get_db)):
    # Query nhà hàng + tên vùng + load relationship cuisines
    query = (
        select(Restaurant, Region.name.label("region_name"))
        .join(Region, Restaurant.region_id == Region.id)
        .options(
            selectinload(Restaurant.cuisines_data).selectinload(RestaurantCuisine.cuisine)
        )
        .order_by(Restaurant.id.desc())
    )
    result = await db.execute(query)
    rows = result.all()

    # Map data sang format Response
    data = []
    for r, region_name in rows:
        r_dict = {
    "id": r.id,
    "region_id": r.region_id,
    "name": r.name,
    "description": r.description,
    "address": r.address,
    "map_url": r.map_url,
    "rating": r.rating,
    "image_urls": r.image_urls or [],
    "tags": r.tags or [],
    "is_active": r.is_active,
    "created_at": r.created_at,
}
        r_dict["region_name"] = region_name
        # Map cuisines_data để lấy tên cuisine
        mapped_cuisines = []
        for rc in r.cuisines_data:
            mapped_cuisines.append({
                "id": rc.id,
                "cuisine_id": rc.cuisine_id,
                "cuisine_name": rc.cuisine.name if rc.cuisine else "Unknown",
                "description": rc.description,
                "average_price": rc.average_price,
                "price_range": rc.price_range,
                "is_available": rc.is_available,
                "image_url": rc.image_url,
            })
        r_dict["cuisines_data"] = mapped_cuisines
        data.append(r_dict)
    return data

# --- CREATE ---
@router.post("/restaurants")
async def create_restaurant(item_in: RestaurantCreate, db: AsyncSession = Depends(get_db)):
    # 1. Tạo Restaurant
    restaurant = Restaurant(
        **item_in.model_dump(exclude={"cuisines"}),
    )
    db.add(restaurant)
    await db.flush() # Để lấy ID restaurant vừa tạo

    # 2. Tạo các RestaurantCuisine
    for c_in in item_in.cuisines:
        rc = RestaurantCuisine(
            restaurant_id=restaurant.id,
            **c_in.model_dump()
        )
        db.add(rc)

    await db.commit()
    return {"message": "Created", "id": restaurant.id}

# --- UPDATE ---
@router.put("/restaurants/{id}")
async def update_restaurant(id: int, item_in: RestaurantUpdate, db: AsyncSession = Depends(get_db)):
    # 1. Get Old Data
    query = select(Restaurant).where(Restaurant.id == id).options(selectinload(Restaurant.cuisines_data))
    result = await db.execute(query)
    restaurant = result.scalar_one_or_none()
    
    if not restaurant:
        raise HTTPException(404, "Restaurant not found")

    # 2. Update Basic Info
    update_data = item_in.model_dump(exclude={"cuisines"})
    for k, v in update_data.items():
        setattr(restaurant, k, v)

    # 3. Update Cuisines (Chiến thuật: Xóa hết cũ, tạo mới)
    # Xóa các liên kết cũ
    for old_rc in restaurant.cuisines_data:
        await db.delete(old_rc)
    
    # Thêm mới từ request
    for c_in in item_in.cuisines:
        new_rc = RestaurantCuisine(
            restaurant_id=restaurant.id,
            **c_in.model_dump()
        )
        db.add(new_rc)

    await db.commit()
    return {"message": "Updated"}

# --- DELETE ---
@router.delete("/restaurants/{id}")
async def delete_restaurant(id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Restaurant).where(Restaurant.id == id))
    restaurant = result.scalar_one_or_none()
    if not restaurant:
        raise HTTPException(404, "Not found")
    
    await db.delete(restaurant)
    await db.commit()
    return {"message": "Deleted"}