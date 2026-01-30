import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv() # Load API KEY từ file .env

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_itinerary(region: str, days: int, budget: str, db_locations: list):
    locations_context = "\n".join([
        f"- {loc.name} ({loc.type}): {loc.description}, Giá: {loc.price_avg}, Rating: {loc.rating}"
        for loc in db_locations
    ])

    prompt = f"""
    Bạn là chuyên gia du lịch MichiJapan. Hãy thiết kế lịch trình {days} ngày tại {region} với ngân sách {budget}.
    QUAN TRỌNG: Chỉ trả về JSON thuần túy, không bao gồm ký tự markdown ```json hay giải thích gì thêm.
    
    Dữ liệu ưu tiên:
    {locations_context}

    Định dạng JSON:
    {{
        "trip_name": "Tên chuyến đi",
        "total_estimated_cost": 5000000,
        "schedule": [
            {{
                "day": 1,
                "activities": [
                    {{"time": "08:00", "place": "Địa điểm", "note": "Ghi chú"}}
                ]
            }}
        ]
    }}
    """

    model = genai.GenerativeModel('gemini-1.5-flash')
    
    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        # Xử lý cắt bỏ markdown nếu AI lỡ tay thêm vào
        if "```" in content:
            content = content.replace("```json", "").replace("```", "").strip()
        
        # Tìm cặp ngoặc nhọn đầu và cuối để đảm bảo chỉ lấy JSON
        start = content.find('{')
        end = content.rfind('}') + 1
        return json.loads(content[start:end])
        
    except Exception as e:
        print(f"AI Service Error: {e}")
        # Trả về một cấu trúc mặc định để Frontend không bị crash
        return {
            "trip_name": "Lỗi lịch trình",
            "total_estimated_cost": 0,
            "schedule": [{"day": 1, "activities": [{"time": "00:00", "place": "Không thể tạo lịch trình", "note": str(e)}]}]
        }
    # 1. Chuyển data từ DB thành chuỗi text để AI đọc
    locations_context = "\n".join([
        f"- {loc.name} ({loc.type}): {loc.description}, Giá: {loc.price_avg}, Rating: {loc.rating}"
        for loc in db_locations
    ])

    # 2. System Prompt cực kỳ quan trọng
    prompt = f"""
    Bạn là chuyên gia du lịch MichiJapan. Hãy thiết kế lịch trình {days} ngày tại {region} với ngân sách {budget}.
    
    QUAN TRỌNG: Chỉ được gợi ý các địa điểm có trong danh sách sau đây (nếu phù hợp), nếu thiếu có thể gợi ý thêm địa điểm nổi tiếng bên ngoài nhưng ưu tiên danh sách này:
    {locations_context}

    Hãy trả về kết quả KHÔNG có markdown, chỉ là thuần JSON theo định dạng sau:
    {{
        "trip_name": "Tên chuyến đi hấp dẫn",
        "total_estimated_cost": 5000000,
        "schedule": [
            {{
                "day": 1,
                "activities": [
                    {{"time": "08:00", "place": "Tên địa điểm", "note": "Làm gì ở đó"}}
                ]
            }}
        ],
        "recommended_stays": ["Tên khách sạn trong list"],
        "recommended_food": ["Tên quán ăn"]
    }}
    """

    model = genai.GenerativeModel('gemini-1.5-flash')
    try:
        response = model.generate_content(prompt)
        # Lấy nội dung text
        content = response.text
        
        # Tìm vị trí thực sự của JSON nếu AI lỡ tay viết thêm text ở ngoài
        start_index = content.find('{')
        end_index = content.rfind('}') + 1
        json_str = content[start_index:end_index]
        
        return json.loads(json_str)
    except Exception as e:
        print(f"Error parsing AI response: {e}")
        return {"error": "AI response was not in valid JSON format", "raw": response.text}
    
    
    # Xử lý chuỗi để lấy đúng JSON
    clean_json = response.text.replace("```json", "").replace("```", "")
    return json.loads(clean_json)