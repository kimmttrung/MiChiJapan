from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Date, Time, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class RestaurantBooking(Base):
    __tablename__ = "restaurant_bookings"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))

    # Thông tin khách hàng
    guest_full_name = Column(String(255), nullable=False)
    guest_email = Column(String(255), nullable=False)
    guest_phone = Column(String(50), nullable=False)

    # Chi tiết đặt bàn
    booking_date = Column(Date, nullable=False) # Ngày đến
    booking_time = Column(Time, nullable=False) # Giờ đến
    guests = Column(Integer, default=2)          # Số lượng khách
    special_request = Column(Text, nullable=True)

    # Trạng thái hệ thống
    status = Column(String(50), default="pending") # pending, confirmed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    # Quan hệ (Relationships)
    restaurant = relationship("Restaurant", back_populates="bookings")
    user = relationship("User")