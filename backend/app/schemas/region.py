from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RegionBase(BaseModel):
    name: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RegionCreate(RegionBase):
    pass

class RegionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RegionResponse(RegionBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
