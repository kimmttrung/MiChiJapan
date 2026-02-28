from datetime import date
from sqlalchemy.orm import Session
from app.models.hotel_booking import HotelBooking
from app.models.payment import Payment
from app.models.hotel import Hotel
from fastapi import HTTPException


def create_booking(db: Session, data, current_user=None):

    hotel = db.query(Hotel).filter(Hotel.id == data.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    if data.check_out <= data.check_in:
        raise HTTPException(status_code=400, detail="Invalid date range")

    total_nights = (data.check_out - data.check_in).days
    price_per_night = hotel.price_per_night
    total_amount = total_nights * price_per_night

    booking = HotelBooking(
        hotel_id=data.hotel_id,
        user_id=current_user.id if current_user else None,
        guest_full_name=data.guest_full_name,
        guest_email=data.guest_email,
        guest_phone=data.guest_phone,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        price_per_night=price_per_night,
        total_nights=total_nights,
        total_amount=total_amount,
        status="pending"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    payment = Payment(
        booking_id=booking.id,
        payment_method="cash",
        payment_status="unpaid"
    )

    db.add(payment)
    db.commit()

    return