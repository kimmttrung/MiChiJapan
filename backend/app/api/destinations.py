from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models.region import Region
from app.models.restaurant import Restaurant, RestaurantCuisine # Cần import các model này
from app.schemas.destinations import DestinationDetail 

router = APIRouter()

@router.get("/{region_id}", response_model=DestinationDetail)
async def get_destination_detail(region_id: int, db: AsyncSession = Depends(get_db)):
    # Sử dụng selectinload để tải dữ liệu phân tầng hiệu quả trong Async
    query = (
        select(Region)
        .options(
            selectinload(Region.hotels),
            selectinload(Region.spots),
            # Tải Restaurant -> RestaurantCuisine -> Cuisine (để lấy tên món ăn)
            selectinload(Region.restaurants)
                .selectinload(Restaurant.cuisines_data)
                .selectinload(RestaurantCuisine.cuisine)
        )
        .where(Region.id == region_id)
    )
    
    result = await db.execute(query)
    region = result.scalar_one_or_none() 
    
    if not region:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin điểm đến này.")
    
    return region