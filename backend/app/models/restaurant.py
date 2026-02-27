from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Float, DateTime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Bảng danh mục các loại ẩm thực (VD: Nhật, Hàn, Việt...)
class Cuisine(Base):
    __tablename__ = "cuisines"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), unique=True, nullable=False)

# Bảng liên kết: Nhà hàng bán Ẩm thực nào, giá bao nhiêu
class RestaurantCuisine(Base):
    __tablename__ = "restaurant_cuisines"
    id = Column(Integer, primary_key=True)
    
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"))
    cuisine_id = Column(Integer, ForeignKey("cuisines.id", ondelete="CASCADE"))
    
    description = Column(Text)
    average_price = Column(Integer)
    price_range = Column(String(50))
    image_url = Column(Text)
    is_available = Column(Boolean, default=True)

    # Relationships
    cuisine = relationship("Cuisine") 
    restaurant = relationship("Restaurant", back_populates="cuisines_data")
    # Thêm property này để Schema tự động nhận diện cuisine_name
    @property
    def cuisine_name(self):
        return self.cuisine.name if self.cuisine else None

# Bảng chính: Nhà hàng
class Restaurant(Base):
    __tablename__ = "restaurants"

    id = Column(Integer, primary_key=True)
    region_id = Column(Integer, ForeignKey("regions.id", ondelete="CASCADE"))

    name = Column(String(255), nullable=False)
    description = Column(Text)
    address = Column(Text)
    map_url = Column(Text)
    
    rating = Column(Float)
    
    image_urls = Column(ARRAY(Text))
    tags = Column(ARRAY(Text))
    
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    region = relationship("Region")
    # Link tới bảng trung gian
    cuisines_data = relationship("RestaurantCuisine", back_populates="restaurant", cascade="all, delete-orphan")
    region = relationship("Region", back_populates="restaurants")