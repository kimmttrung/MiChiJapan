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
