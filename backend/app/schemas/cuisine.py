from pydantic import BaseModel
from typing import Optional

class CuisineBase(BaseModel):
    name: str

class CuisineCreate(CuisineBase):
    pass

class CuisineUpdate(CuisineBase):
    pass

class CuisineResponse(CuisineBase):
    id: int

    class Config:
        from_attributes = True