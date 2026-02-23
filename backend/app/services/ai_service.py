import json
from groq import Groq
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

async def generate_trip_plan(prompt: str, db: AsyncSession):
    try:
        # --- BƯỚC 1: NHẬN DIỆN VÙNG ---
        regions_res = await db.execute(text("SELECT id, name FROM regions"))
        regions = regions_res.fetchall()
        
        target_region_id = None
        for r in regions:
            if r.name.lower() in prompt.lower():
                target_region_id = r.id
                break

        # --- BƯỚC 2: TRÍCH XUẤT DỮ LIỆU ---
        # Lấy Top 3 KS và Top 5 Nhà hàng để tiết kiệm Token
        hotel_sql = "SELECT name, price_per_night, rating FROM hotels WHERE is_active = True"
        if target_region_id:
            hotel_sql += f" AND region_id = {target_region_id}"
        
        hotels_res = await db.execute(text(hotel_sql + " ORDER BY rating DESC LIMIT 3"))
        list_hotels = hotels_res.fetchall()

        rest_sql = "SELECT name, rating FROM restaurants WHERE is_active = True"
        if target_region_id:
            rest_sql += f" AND region_id = {target_region_id}"
        
        rest_res = await db.execute(text(rest_sql + " ORDER BY rating DESC LIMIT 5"))
        list_restaurants = rest_res.fetchall()

        # --- BƯỚC 3: CONTEXT TINH GỌN ---
        h_ctx = "\n".join([f"- {h.name}: {h.price_per_night}đ ({h.rating}*)" for h in list_hotels])
        r_ctx = "\n".join([f"- {r.name} ({r.rating}*)" for r in list_restaurants])

        # --- BƯỚC 4: PROMPT ---
        full_prompt = f"""
Dữ liệu:
KS: {h_ctx}
QUÁN: {r_ctx}
Yêu cầu: "{prompt}"

Nhiệm vụ: Trả về JSON lịch trình du lịch. 
Lưu ý: Tính toán chi tiết 'price' từng mục sao cho tổng chi phí khớp với ngân sách user mong muốn.

JSON Format:
{{
  "title": "Tên chuyến đi",
  "budget_summary": {{ "total_per_person": 0, "note": "Giải thích chi phí" }},
  "itinerary": [
    {{
      "day": 1,
      "items": [
        {{ "time": "HH:mm", "activity": "Mô tả", "location": "Tên", "type": "dining/visit/hotel", "price": 0 }}
      ]
    }}
  ]
}}
"""
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": full_prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        ai_data = json.loads(chat_completion.choices[0].message.content)
        
        # Trả thêm region_id để Frontend dễ quản lý khi lưu
        ai_data["region_id"] = target_region_id
        return ai_data

    except Exception as e:
        print(f"Lỗi: {e}")
        return {"title": "Lỗi", "budget_summary": {"total_per_person": 0}, "itinerary": []}