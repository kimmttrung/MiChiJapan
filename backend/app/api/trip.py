from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.trip import TripRequest, TripResponse
from app.services.ai_service import generate_trip_plan

router = APIRouter()

@router.post("/generate", response_model=TripResponse)
async def generate_trip(request: TripRequest, db: AsyncSession = Depends(get_db)):
    """
    API nhận prompt từ Frontend, kết hợp dữ liệu DB và trả về JSON lịch trình.
    """
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    trip_plan = await generate_trip_plan(request.prompt, db)
    return trip_plan