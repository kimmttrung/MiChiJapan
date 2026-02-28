from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(Integer, ForeignKey("hotel_bookings.id", ondelete="CASCADE"))

    payment_method = Column(String(50))
    payment_status = Column(String(30), default="unpaid")

    transaction_id = Column(String(255), nullable=True)
    paid_at = Column(TIMESTAMP, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())

    booking = relationship("HotelBooking", back_populates="payment")