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

class DayPlan(BaseModel):
    day: int
    items: List[TripItem]

class TripResponse(BaseModel):
    title: str
    # summary: str  <-- XÓA HOẶC CHUYỂN THÀNH Optional
    budget_summary: BudgetSummary # THÊM MỚI
    itinerary: List[DayPlan]