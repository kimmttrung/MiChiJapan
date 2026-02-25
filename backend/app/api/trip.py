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
        query_trip = text("""
            INSERT INTO trips (user_id, region_id, title, total_days, total_budget, members, budget_per_person, ai_result, is_saved)
            VALUES (:u_id, :r_id, :title, :days, :budget, :mems, :b_per_p, :result, :saved)
            RETURNING id
        """)
        result = await db.execute(query_trip, {
            "u_id": user_id, "r_id": data.region_id, "title": data.title,
            "days": data.total_days, "budget": data.total_budget, "mems": data.members,
            "b_per_p": data.budget_per_person, "result": json.dumps(data.ai_result), "saved": True
        })
        trip_id = result.scalar()

        # --- BƯỚC 2: LƯU VÀO BẢNG TRIP_ITEMS (Thay Lat/Lng bằng map_url) ---
        itinerary = data.ai_result.get("itinerary", [])
        for day_data in itinerary:
            day_number = day_data.get("day")
            for item in day_data.get("items", []):
                query_item = text("""
                    INSERT INTO trip_items (
                        trip_id, day_number, time_slot, activity, 
                        location, item_type, price, image_url, details,
                        map_url
                    )
                    VALUES (
                        :t_id, :day, :time, :act, 
                        :loc, :type, :price, :img, :det,
                        :m_url
                    )
                """)
                await db.execute(query_item, {
                    "t_id": trip_id, "day": day_number, "time": item.get("time"),
                    "act": item.get("activity"), "loc": item.get("location"),
                    "type": item.get("type"), "price": item.get("price", 0),
                    "img": item.get("image_url"), "det": item.get("details"),
                    "m_url": item.get("map_url")  # Lưu map_url
                })
        await db.commit()
        return {"message": "Lưu lịch trình thành công", "trip_id": trip_id}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-trips")
async def get_my_trips(db: AsyncSession = Depends(get_db)):
    try:
        query_trips = text("SELECT * FROM trips WHERE user_id = 1 ORDER BY created_at DESC")
        result_trips = await db.execute(query_trips)
        trips_rows = result_trips.fetchall()
        
        final_data = []
        for trip in trips_rows:
            query_items = text("SELECT * FROM trip_items WHERE trip_id = :t_id ORDER BY day_number ASC, time_slot ASC")
            result_items = await db.execute(query_items, {"t_id": trip.id})
            items_rows = result_items.fetchall()

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
                    "details": item.details,
                    "map_url": item.map_url # Trả về map_url cho Frontend
                })

            final_data.append({
                "id": trip.id, "title": trip.title, "total_days": trip.total_days,
                "budget_per_person": trip.budget_per_person,
                "ai_result": {
                    "title": trip.title,
                    "itinerary": list(itinerary_from_db.values()),
                    "budget_summary": {"total_per_person": trip.budget_per_person, "note": "Dữ liệu hệ thống"}
                }
            })
        return final_data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi tải dữ liệu")

from sqlalchemy import text
import json

@router.get("/my-trips")
async def get_my_trips(db: AsyncSession = Depends(get_db)):
    try:
        query_trips = text("SELECT * FROM trips WHERE user_id = 1 ORDER BY created_at DESC")
        result_trips = await db.execute(query_trips)
        trips_rows = result_trips.fetchall()
        
        final_data = []
        for trip in trips_rows:
            query_items = text("""
                SELECT * FROM trip_items 
                WHERE trip_id = :t_id 
                ORDER BY day_number ASC, time_slot ASC
            """)
            result_items = await db.execute(query_items, {"t_id": trip.id})
            items_rows = result_items.fetchall()

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
                    "details": item.details,
                    "lat": item.latitude,  # Trả về Lat cho Frontend
                    "lng": item.longitude  # Trả về Lng cho Frontend
                })

            final_data.append({
                "id": trip.id,
                "title": trip.title,
                "total_days": trip.total_days,
                "budget_per_person": trip.budget_per_person,
                "ai_result": {
                    "title": trip.title,
                    "itinerary": list(itinerary_from_db.values()),
                    "budget_summary": {"total_per_person": trip.budget_per_person, "note": "Dữ liệu từ hệ thống"}
                }
            })
        return final_data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Lỗi tải dữ liệu")

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
async def update_trip(trip_id: int, data: TripUpdateSchema, db: AsyncSession = Depends(get_db)):
    try:
        # 🔹 1. Cập nhật bảng trips (Bảng cha)
        # Lưu toàn bộ cấu trúc mới vào trường JSON ai_result để đồng bộ
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
                "itinerary": data.itinerary,
                "budget_summary": {
                    "total_per_person": data.budget_per_person,
                    "note": "Đã cập nhật từ người dùng"
                }
            }),
            "t_id": trip_id
        })

        # 🔹 2. Xóa toàn bộ các mục cũ trong trip_items của chuyến đi này
        await db.execute(text("DELETE FROM trip_items WHERE trip_id = :t_id"), {"t_id": trip_id})

        # 🔹 3. Chèn lại các mục mới từ dữ liệu chỉnh sửa (Sử dụng map_url thay cho lat/lng)
        for day_data in data.itinerary:
            day_number = day_data.get("day")
            items = day_data.get("items", [])
            
            for item in items:
                await db.execute(text("""
                    INSERT INTO trip_items (
                        trip_id, 
                        day_number, 
                        time_slot, 
                        activity,
                        location, 
                        item_type, 
                        price, 
                        image_url, 
                        details,
                        map_url
                    )
                    VALUES (
                        :t_id, :day, :time, :act, :loc, :type, :price, :img, :det, :m_url
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
                    "det": item.get("details"),
                    "m_url": item.get("map_url")  # Lưu đường dẫn bản đồ
                })

        # Lưu thay đổi vào Database
        await db.commit()
        return {"message": "Cập nhật chuyến đi thành công"}

    except Exception as e:
        # Nếu có lỗi, hoàn tác các thay đổi đã thực hiện trong phiên này
        await db.rollback()
        print(f"Lỗi khi update trip: {e}")
        raise HTTPException(status_code=500, detail=f"Không thể cập nhật: {str(e)}")