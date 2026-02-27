from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Boolean, DateTime, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base # Giả định bạn đã config Base

class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    cover_image = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    
    hotels = relationship("Hotel", back_populates="region")
    resorts = relationship("Resort", back_populates="region")
    restaurants = relationship("Restaurant", back_populates="region")

class Hotel(Base):
    __tablename__ = "hotels"
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    address = Column(Text)
    price_per_night = Column(Integer)
    rating = Column(Float)
    image_urls = Column(ARRAY(Text))
    tags = Column(ARRAY(Text))
    region = relationship("Region", back_populates="hotels")

class Restaurant(Base):
    __tablename__ = "restaurants"
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    name = Column(String, nullable=False)
    description = Column(Text)
    address = Column(Text)
    rating = Column(Float)
    image_urls = Column(ARRAY(Text))
    tags = Column(ARRAY(Text))
    
    # Liên kết với bảng phụ restaurant_cuisines
    cuisines = relationship("RestaurantCuisine", back_populates="restaurant")
    region = relationship("Region", back_populates="restaurants")

class RestaurantCuisine(Base):
    __tablename__ = "restaurant_cuisines"
    id = Column(Integer, primary_key=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"))
    average_price = Column(Integer)
    price_range = Column(String)
    restaurant = relationship("Restaurant", back_populates="cuisines")