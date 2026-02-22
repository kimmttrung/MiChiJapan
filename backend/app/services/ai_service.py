import json
from groq import Groq
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

async def generate_trip_plan(prompt: str, db: AsyncSession):
    try:
        # --- BƯỚC 1: NHẬN DIỆN VÙNG NHANH ---
        regions_res = await db.execute(text("SELECT id, name FROM regions"))
        regions = regions_res.fetchall()
        
        target_region_id = None
        for r in regions:
            if r.name.lower() in prompt.lower():
                target_region_id = r.id
                break

        # --- BƯỚC 2: TRÍCH XUẤT DỮ LIỆU CỐT LÕI ---
        # Chỉ lấy Tên, Giá, Đánh giá (Bỏ ảnh để tiết kiệm Token tuyệt đối)
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

        # --- BƯỚC 3: CONTEXT SIÊU SẠCH ---
        # AI sẽ dựa vào giá khách sạn để ước lượng tổng chi phí
        h_ctx = "\n".join([f"- {h.name}: {h.price_per_night}đ/đêm ({h.rating}*)" for h in list_hotels])
        r_ctx = "\n".join([f"- {r.name} ({r.rating}*)" for r in list_restaurants])

        # --- BƯỚC 4: PROMPT TẬP TRUNG VÀO NGÂN SÁCH ---
        full_prompt = f"""
Sử dụng dữ liệu:
KS: {h_ctx}
QUÁN: {r_ctx}

YÊU CẦU: "{prompt}"

NHIỆM VỤ:
1. Phân tích số người/ngày/ngân sách từ yêu cầu.
2. Lập lịch trình CHI TIẾT. Tính toán 'price' cho mỗi hoạt động sao cho tổng khớp với ngân sách của user.
3. Trả về JSON format: 
{{
  "title": "Tên chuyến đi",
  "budget_summary": {{"total_per_person": 0, "note": "Ghi chú chia tiền"}},
  "itinerary": [
    {{
      "day": 1,
      "items": [
        {{ "time": "HH:mm", "activity": "Mô tả", "location": "Tên quán/KS", "type": "dining/visit/hotel", "price": 0 }}
      ]
    }}
  ]
}}
"""

        # --- BƯỚC 5: GỌI AI ---
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": full_prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.3
        )
        
        return json.loads(chat_completion.choices[0].message.content)

    except Exception as e:
        print(f"Lỗi: {e}")
        return {"title": "Lỗi kết nối", "budget_summary": {"total_per_person": 0, "note": "Thử lại"}, "itinerary": []}