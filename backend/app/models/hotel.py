from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Float  
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base

class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True)

    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE"))

    name = Column(String(255), nullable=False)
    description = Column(Text)
    address = Column(Text)

    price_per_night = Column(Integer)
    rating = Column(Float)

    map_url = Column(Text)

    # ✅ ARRAY
    image_urls = Column(ARRAY(Text))
    tags = Column(ARRAY(Text))

    is_active = Column(Boolean, default=True)

    region = relationship("Region", back_populates="hotels")
