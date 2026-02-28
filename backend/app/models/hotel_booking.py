from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class HotelBooking(Base):
    __tablename__ = "hotel_bookings"

    id = Column(Integer, primary_key=True, index=True)

    hotel_id = Column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    guest_full_name = Column(String(255), nullable=True)
    guest_email = Column(String(255), nullable=True)
    guest_phone = Column(String(50), nullable=True)

    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)

    guests = Column(Integer, nullable=False)

    price_per_night = Column(Integer, nullable=False)
    total_nights = Column(Integer, nullable=False)
    total_amount = Column(Integer, nullable=False)

    special_request = Column(Text)

    status = Column(String(30), default="pending")

    created_at = Column(TIMESTAMP, server_default=func.now())

    payment = relationship("Payment", back_populates="booking", uselist=False)
    hotel_id = Column(Integer, ForeignKey("hotels.id"))
    hotel = relationship("Hotel")
    user = relationship("User")