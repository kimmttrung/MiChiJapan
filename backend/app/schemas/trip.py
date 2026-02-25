# app/schemas/trip.py
from pydantic import BaseModel
from typing import List, Any, Optional

class TripRequest(BaseModel):
    prompt: str

class BudgetSummary(BaseModel):
    total_per_person: int
    note: str

class TripItem(BaseModel):
    time: str
    activity: str
    location: str
    type: str
    price: int
    image_url: Optional[str] = ""
    details: Optional[str] = ""
    map_url: Optional[str] = None

class DayPlan(BaseModel):
    day: int
    items: List[TripItem]

class TripResponse(BaseModel):
    title: str
    # summary: str  <-- XÓA HOẶC CHUYỂN THÀNH Optional
    budget_summary: BudgetSummary # THÊM MỚI    
    itinerary: List[DayPlan]

class SaveTripSchema(BaseModel):
    region_id: Optional[int] = None # Cho phép null nếu không tìm thấy vùng
    title: str
    total_days: int
    members: int
    total_budget: int
    budget_per_person: int
    ai_result: dict # Hoặc Any, để nhận toàn bộ Object JSON

class TripItemUpdate(BaseModel):
    day: int
    time: Optional[str]
    activity: str
    location: Optional[str]
    type: Optional[str]
    price: Optional[int] = 0
    image_url: Optional[str]
    details: Optional[str]

class TripUpdateSchema(BaseModel):
    region_id: Optional[int]
    title: str
    total_days: int
    total_budget: int
    members: int
    budget_per_person: int
    itinerary: List[dict]