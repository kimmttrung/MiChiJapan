# app/models/place.py
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True)
    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE"))

    name = Column(String(255), nullable=False)
    place_type = Column(String(30), nullable=False)

    description = Column(Text)
    address = Column(Text)
    map_url = Column(Text)

    average_price = Column(Integer)
    price_range = Column(String(50))

    rating = Column(Float)
    image_urls = Column(ARRAY(Text))
    tags = Column(ARRAY(Text))

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    region = relationship("Region", back_populates="spots")