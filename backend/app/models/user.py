from sqlalchemy import Column, Integer, String, Text, Boolean, TIMESTAMP,  Float, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)

    full_name = Column(String(255))
    avatar_url = Column(Text)
    phone = Column(String(20))
    address = Column(Text)
    bio = Column(Text)

    role = Column(String(20), default="user")
    is_verified = Column(Boolean, default=False)

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now())

# --- Region Model ---
class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    cover_image = Column(Text)
    latitude = Column(Float)
    longitude = Column(Float)
    
    hotels = relationship("Hotel", back_populates="region")

# --- Hotel Model ---
class Hotel(Base):
    __tablename__ = "hotels"
    id = Column(Integer, primary_key=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    name = Column(String(255), nullable=False)
    address = Column(Text)
    price_per_night = Column(Integer)
    rating = Column(Float)
    is_active = Column(Boolean, default=True)
    
    region = relationship("Region", back_populates="hotels")
