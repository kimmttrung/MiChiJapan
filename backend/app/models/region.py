# app/models/region.py
from sqlalchemy import Column, Integer, String, Text, Float, TIMESTAMP
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship

class Region(Base):
    __tablename__ = "regions"
    # Thêm dòng này để cho phép định nghĩa lại nếu đã tồn tại
    __table_args__ = {'extend_existing': True} 

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    cover_image = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    hotels = relationship("Hotel", back_populates="region", cascade="all, delete")
    restaurants = relationship("Restaurant", back_populates="region")
    spots = relationship("Place", back_populates="region")