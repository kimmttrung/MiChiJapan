import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.trip import TripRequest, TripResponse, SaveTripSchema, TripUpdateSchema
from app.services.ai_service import generate_trip_plan
from sqlalchemy import text
from app.dependencies import get_current_user, get_current_admin

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
async def save_user_trip(
    data: SaveTripSchema, 
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # --- BƯỚC 1: LƯU VÀO BẢNG TRIPS (Bạn đã viết xong) ---
        query_trip = text("""
            INSERT INTO trips (
                user_id, region_id, title, total_days, total_budget, 
                members, budget_per_person, ai_result,
                guest_name, guest_phone, guest_email, transport, special_request
            )
            VALUES (
                :u_id, :r_id, :title, :days, :budget, 
                :mems, :b_per_p, :result,
                :g_name, :g_phone, :g_email, :trans, :spec
            )
            RETURNING id
        """)
        
        result = await db.execute(query_trip, {
            "u_id": current_user.id,
            "r_id": data.region_id,
            "title": data.title,
            "days": data.total_days,
            "budget": data.total_budget,
            "mems": data.members,
            "b_per_p": data.budget_per_person,
            "result": json.dumps(data.ai_result),
            "g_name": data.guest_name,
            "g_phone": data.guest_phone,
            "g_email": data.guest_email,
            "trans": data.transport,
            "spec": data.special_request
        })
        trip_id = result.scalar()

        # --- BƯỚC 2: LƯU VÀO BẢNG TRIP_ITEMS ---
        # Lấy itinerary từ ai_result gửi lên
        itinerary = data.ai_result.get("itinerary", [])
        
        for day_data in itinerary:
            day_number = day_data.get("day")
            items = day_data.get("items", [])
            
            for item in items:
                # Trích xuất item_id từ AI để lưu vào reference_id
                # Nếu AI trả về null hoặc 0, ta lưu None
                ref_id = item.get("item_id")
                if not ref_id or ref_id == 0:
                    ref_id = None

                query_item = text("""
                    INSERT INTO trip_items (
                        trip_id, day_number, time_slot, activity, 
                        location, item_type, price, image_url, details, 
                        map_url, reference_id
                    )
                    VALUES (
                        :t_id, :day, :time, :act, 
                        :loc, :type, :price, :img, :det, 
                        :m_url, :ref_id
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
                    "img": item.get("image_url", ""),
                    "det": item.get("details", ""),
                    "m_url": item.get("map_url"),
                    "ref_id": ref_id  # Lưu ID khách sạn/nhà hàng thật vào đây
                })
        
        await db.commit()
        return {
            "status": "success", 
            "message": "Đã lưu lịch trình thành công", 
            "trip_id": trip_id
        }

    except Exception as e:
        await db.rollback()
        print(f"Error at /save: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Lỗi khi lưu dữ liệu: {str(e)}")

@router.get("/my-trips")
async def get_my_trips(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    try:
        # Lấy toàn bộ thông tin từ bảng trips của user hiện tại
        query_trips = text("""
            SELECT id, region_id, title, total_days, budget_per_person 
            FROM trips 
            WHERE user_id = :u_id 
            ORDER BY created_at DESC
        """)
        
        result_trips = await db.execute(query_trips, {"u_id": current_user.id})
        trips_rows = result_trips.fetchall()
        
        final_data = []
        for trip in trips_rows:
            # Truy vấn lấy các điểm đến trong hành trình
            query_items = text("""
                SELECT time_slot, activity, location, item_type, price, 
                       image_url, map_url, reference_id, day_number, details
                FROM trip_items 
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
                    "map_url": item.map_url,
                    "details": item.details,
                    "item_id": item.reference_id # Trả về ID gốc (Hotel/Rest) để làm Link
                })

            # Đóng gói dữ liệu tương thích với cấu trúc AI Trip Planner
            final_data.append({
                "id": trip.id, 
                "region_id": trip.region_id, # Thêm ở cấp cao nhất để FE lấy cho Link gốc
                "title": trip.title, 
                "total_days": trip.total_days,
                "budget_per_person": trip.budget_per_person,
                "ai_result": {
                    "title": trip.title,
                    "region_id": trip.region_id, # Thêm vào trong ai_result để đồng bộ
                    "itinerary": list(itinerary_from_db.values()),
                    "budget_summary": {
                        "total_per_person": trip.budget_per_person, 
                        "note": "Dữ liệu được tải từ lịch sử cá nhân"
                    }
                }
            })
            
        return final_data

    except Exception as e:
        print(f"Error fetching trips: {str(e)}")
        raise HTTPException(status_code=500, detail="Không thể tải danh sách lịch trình cá nhân")

@router.delete("/admin/trips/{trip_id}")
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
    

@router.get("/admin/trips/all")
async def get_all_trips_admin(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    try:
        # SQL JOIN để lấy thông tin user
        sql = text("""
            SELECT t.*, u.full_name as user_name, u.phone as user_phone, 
                   u.email as user_email, u.avatar_url as user_avatar 
            FROM trips t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        """)
        result = await db.execute(sql)
        trips_rows = result.fetchall()
        
        final_data = []
        for trip in trips_rows:
            # Lấy các item thuộc trip này
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
                    "price": item.price
                })

            final_data.append({
                "id": trip.id,
                "title": trip.title,
                "total_days": trip.total_days,
                "budget_per_person": trip.budget_per_person,
                "created_at": trip.created_at,
                "user_info": {
                    "name": trip.user_name,
                    "phone": trip.user_phone,
                    "email": trip.user_email,
                    "avatar": trip.user_avatar
                },
                "itinerary": list(itinerary_from_db.values())
            })
        return final_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))