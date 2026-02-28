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

        # --- BƯỚC 2: TRÍCH XUẤT DỮ LIỆU (Thêm ID vào truy vấn) ---
        hotel_sql = "SELECT id, name, price_per_night, rating, map_url FROM hotels WHERE is_active = True"
        if target_region_id:
            hotel_sql += f" AND region_id = {target_region_id}"
        hotels_res = await db.execute(text(hotel_sql + " ORDER BY rating DESC LIMIT 3"))
        list_hotels = hotels_res.fetchall()

        rest_sql = "SELECT id, name, rating, map_url FROM restaurants WHERE is_active = True"
        if target_region_id:
            rest_sql += f" AND region_id = {target_region_id}"
        rest_res = await db.execute(text(rest_sql + " ORDER BY rating DESC LIMIT 5"))
        list_restaurants = rest_res.fetchall()

        # --- BƯỚC 3: CONTEXT TINH GỌN (Đưa ID vào Context) ---
        # Chúng ta định dạng: [ID: x] Tên... để AI dễ nhận biết
        # Trong Bước 3:
        h_ctx = "\n".join([f"ID:{h.id} | Tên:{h.name} | Giá:{h.price_per_night}đ | Map:{h.map_url}" for h in list_hotels])
        r_ctx = "\n".join([f"ID:{r.id} | Tên:{r.name} | Map:{r.map_url}" for r in list_restaurants])

        # --- BƯỚC 4: PROMPT NÂNG CẤP (Yêu cầu AI trả về item_id) ---
# --- BƯỚC 4: PROMPT NÂNG CẤP (Ép AI dùng ID từ Database) ---
     # Trong Bước 4:
        full_prompt = f"""
Bạn là AI chuyên gia du lịch.
DỮ LIỆU CÓ SẴN (BẮT BUỘC DÙNG ID NẾU CHỌN):
{h_ctx}
{r_ctx}

YÊU CẦU: "{prompt}"

QUY TẮC:
- Nếu bạn chọn địa điểm có trong DỮ LIỆU CÓ SẴN, bạn PHẢI điền chính xác số ID vào 'item_id'.
- Nếu địa điểm bạn tự nghĩ ra, 'item_id' PHẢI là null.

VÍ DỤ: 
Nếu chọn 'Fusion Treats' từ dữ liệu có ID:5, thì JSON phải là: "location": "Fusion Treats", "item_id": 5.

CẤU TRÚC JSON:
{{
  "title": "...",
  "region_id": {target_region_id if target_region_id else "null"},
  "budget_summary": {{ "total_per_person": 0, "note": "..." }},
  "itinerary": [
    {{
      "day": 1,
      "items": [
        {{ "time": "...", "activity": "...", "location": "...", "item_id": 5, "type": "...", "price": 0, "map_url": "..." }}
      ]
    }}
  ]
}}
"""
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": full_prompt}],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.2 # Giảm xuống để AI tuân thủ cấu trúc tốt hơn
        )
        
        ai_content = chat_completion.choices[0].message.content
        ai_data = json.loads(ai_content)
        
        
        # HẬU XỬ LÝ: Nếu AI quên không thêm region_id hoặc item_id, ta gán thủ công
        ai_data["region_id"] = target_region_id
        
        # Đảm bảo mọi item đều có item_id để không bị lỗi Frontend
        for day in ai_data.get("itinerary", []):
            for item in day.get("items", []):
                if "item_id" not in item:
                    item["item_id"] = None

        print(f"--- Target Region ID: {target_region_id}")
        print(f"--- AI Response: {ai_content}") # Xem AI có thực sự trả về item_id không hay do code logic phía sau
        print(f"--- Hotels Context: {len(list_hotels)} items found")
        
        return ai_data
    
    
        
    except Exception as e:
        print(f"Lỗi generate_trip_plan: {e}")
        return {
            "title": "Lỗi tạo lịch trình", 
            "region_id": None,
            "budget_summary": {"total_per_person": 0, "note": str(e)}, 
            "itinerary": []
        }