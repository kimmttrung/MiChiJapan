import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.trip import TripRequest, TripResponse, SaveTripSchema, TripUpdateSchema
from app.services.ai_service import generate_trip_plan
from sqlalchemy import text

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

@router.post("/save")
async def save_user_trip(data: SaveTripSchema, db: AsyncSession = Depends(get_db)):
    try:
        user_id = 1 

        # --- BƯỚC 1: LƯU VÀO BẢNG TRIPS ---
        query_trip = text("""
            INSERT INTO trips (user_id, region_id, title, total_days, total_budget, members, budget_per_person, ai_result, is_saved)
            VALUES (:u_id, :r_id, :title, :days, :budget, :mems, :b_per_p, :result, :saved)
            RETURNING id
        """)
        
        result = await db.execute(query_trip, {
            "u_id": user_id,
            "r_id": data.region_id,
            "title": data.title,
            "days": data.total_days,
            "budget": data.total_budget,
            "mems": data.members,
            "b_per_p": data.budget_per_person,
            "result": json.dumps(data.ai_result),
            "saved": True
        })
        
        trip_id = result.scalar()

        # --- BƯỚC 2: BÓC TÁCH VÀ LƯU VÀO BẢNG TRIP_ITEMS ---
        # data.ai_result lúc này là dict vì SaveTripSchema định nghĩa là dict/Any
        itinerary = data.ai_result.get("itinerary", [])
        
        for day_data in itinerary:
            day_number = day_data.get("day")
            items = day_data.get("items", [])
            
            for item in items:
                query_item = text("""
                    INSERT INTO trip_items (
                        trip_id, day_number, time_slot, activity, 
                        location, item_type, price, image_url, details
                    )
                    VALUES (
                        :t_id, :day, :time, :act, 
                        :loc, :type, :price, :img, :det
                    )
                """)
                
                await db.execute(query_item, {
                    "t_id": trip_id,
                    "day": day_number,
                    "time": item.get("time"),
                    "act": item.get("activity"),
                    "loc": item.get("location"),
                    "type": item.get("type"),
                    "price": item.get("price", 0),
                    "img": item.get("image_url"),
                    "det": item.get("details")
                })

        # Commit toàn bộ (cả bảng cha và các bảng con)
        await db.commit()
        
        return {"message": "Lưu lịch trình chi tiết thành công", "trip_id": trip_id}
    
    except Exception as e:
        await db.rollback()
        print(f"Lỗi lưu DB: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")

from sqlalchemy import text
import json

@router.get("/my-trips")
async def get_my_trips(db: AsyncSession = Depends(get_db)):
    try:
        # 1. Lấy danh sách Trips
        query_trips = text("SELECT * FROM trips WHERE user_id = 1 ORDER BY created_at DESC")
        result_trips = await db.execute(query_trips)
        trips_rows = result_trips.fetchall()
        
        final_data = []

        for trip in trips_rows:
            # 2. Với mỗi trip, lấy danh sách trip_items tương ứng
            query_items = text("""
                SELECT * FROM trip_items 
                WHERE trip_id = :t_id 
                ORDER BY day_number ASC, time_slot ASC
            """)
            result_items = await db.execute(query_items, {"t_id": trip.id})
            items_rows = result_items.fetchall()

            # 3. Cấu trúc lại items theo từng ngày (Day Grouping)
            # Nếu bạn muốn dùng dữ liệu từ table trip_items thay vì cục JSON ai_result
            itinerary_from_db = {}
            for item in items_rows:
                day_num = item.day_number
                if day_num not in itinerary_from_db:
                    itinerary_from_db[day_num] = {"day": day_num, "items": []}
                
                itinerary_from_db[day_num]["items"].append({
                    "time": item.time_slot,
                    "activity": item.activity,
                    "location": item.location,
                    "type": item.item_type,
                    "price": item.price,
                    "image_url": item.image_url,
                    "details": item.details
                })

            # 4. Gộp vào object cuối cùng
            # Lưu ý: Chúng ta ưu tiên lấy ai_result (JSON) nếu muốn giữ format gốc của AI, 
            # nhưng ở đây tôi sẽ trả về itinerary đã được chuẩn hóa từ Table trip_items.
            final_data.append({
                "id": trip.id,
                "title": trip.title,
                "total_days": trip.total_days,
                "budget_per_person": trip.budget_per_person,
                "total_budget": trip.total_budget,
                # Chuyển dict itinerary sang list để Frontend dễ map()
                "ai_result": {
                    "title": trip.title,
                    "itinerary": list(itinerary_from_db.values()),
                    "budget_summary": {
                        "total_per_person": trip.budget_per_person,
                        "note": "Dữ liệu từ hệ thống"
                    }
                }
            })

        return final_data

    except Exception as e:
        print(f"Lỗi lấy danh sách trip: {e}")
        raise HTTPException(status_code=500, detail="Không thể tải lịch trình")

@router.delete("/trips/{trip_id}")
async def delete_trip(trip_id: int, db: AsyncSession = Depends(get_db)):
    try:
        # Xóa trip_items trước (FK constraint)
        await db.execute(
            text("DELETE FROM trip_items WHERE trip_id = :t_id"),
            {"t_id": trip_id}
        )

        # Xóa trip
        await db.execute(
            text("DELETE FROM trips WHERE id = :t_id"),
            {"t_id": trip_id}
        )

        await db.commit()

        return {"message": "Đã xóa chuyến đi thành công"}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Không thể xóa")
    
@router.put("/trips/{trip_id}")
async def update_trip(
    trip_id: int,
    data: TripUpdateSchema,
    db: AsyncSession = Depends(get_db)
):
    try:
        # 🔹 1. Update bảng trips
        await db.execute(text("""
            UPDATE trips
            SET title = :title,
                region_id = :region_id,
                total_days = :days,
                total_budget = :budget,
                members = :mems,
                budget_per_person = :b_per_p,
                ai_result = :result
            WHERE id = :t_id
        """), {
            "title": data.title,
            "region_id": data.region_id,
            "days": data.total_days,
            "budget": data.total_budget,
            "mems": data.members,
            "b_per_p": data.budget_per_person,
            "result": json.dumps({
                "title": data.title,
                "itinerary": data.itinerary
            }),
            "t_id": trip_id
        })

        # 🔹 2. XÓA toàn bộ trip_items cũ
        await db.execute(
            text("DELETE FROM trip_items WHERE trip_id = :t_id"),
            {"t_id": trip_id}
        )

        # 🔹 3. Insert lại trip_items mới
        for day_data in data.itinerary:
            day_number = day_data.get("day")
            items = day_data.get("items", [])

            for item in items:
                await db.execute(text("""
                    INSERT INTO trip_items (
                        trip_id, day_number, time_slot, activity,
                        location, item_type, price, image_url, details
                    )
                    VALUES (
                        :t_id, :day, :time, :act,
                        :loc, :type, :price, :img, :det
                    )
                """), {
                    "t_id": trip_id,
                    "day": day_number,
                    "time": item.get("time"),
                    "act": item.get("activity"),
                    "loc": item.get("location"),
                    "type": item.get("type"),
                    "price": item.get("price", 0),
                    "img": item.get("image_url"),
                    "det": item.get("details")
                })

        await db.commit()

        return {"message": "Cập nhật trip thành công"}

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))