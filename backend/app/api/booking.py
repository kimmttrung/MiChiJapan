from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse, MyBookingResponse
from app.models.hotel_booking import HotelBooking
from app.dependencies import get_current_user, get_current_admin
from app.models.hotel import Hotel
from sqlalchemy.orm import selectinload
router = APIRouter()

from datetime import date

@router.post("/", response_model=BookingResponse)
async def book_hotel(
    booking: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # 1️⃣ Lấy hotel từ DB
    result = await db.execute(
        select(Hotel).filter(Hotel.id == booking.hotel_id)
    )
    hotel = result.scalars().first()

    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    # 2️⃣ Tính số đêm
    total_nights = (booking.check_out - booking.check_in).days

    if total_nights <= 0:
        raise HTTPException(status_code=400, detail="Invalid date range")

    # 3️⃣ Lấy giá từ hotel
    price_per_night = hotel.price_per_night

    # 4️⃣ Tính tổng tiền
    total_amount = total_nights * price_per_night

    # 5️⃣ Tạo booking
    new_booking = HotelBooking(
        hotel_id=booking.hotel_id,
        user_id=current_user.id,
        guest_full_name=booking.guest_full_name,
        guest_email=booking.guest_email,
        guest_phone=booking.guest_phone,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests=booking.guests,
        special_request=booking.special_request,
        price_per_night=price_per_night,
        total_nights=total_nights,
        total_amount=total_amount,
        status="pending"
    )

    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)

    return new_booking


@router.get("/my-bookings", response_model=list[MyBookingResponse])
async def my_bookings(
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = await db.execute(
        select(HotelBooking)
        .options(selectinload(HotelBooking.hotel))
        .filter(HotelBooking.user_id == current_user.id)
    )

    return result.scalars().all()


@router.patch("/{booking_id}/approve")
async def approve_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    result = await db.execute(
        select(HotelBooking).filter(HotelBooking.id == booking_id)
    )
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Not found")

    booking.status = "confirmed"
    await db.commit()

    return {"message": "Booking confirmed"}


@router.patch("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_admin)
):
    result = await db.execute(
        select(HotelBooking).filter(HotelBooking.id == booking_id)
    )
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Not found")

    booking.status = "cancelled"
    await db.commit()

    return {"message": "Booking cancelled"}

from datetime import datetime, timedelta
from fastapi import HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

@router.delete("/{booking_id}")
async def delete_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Truy vấn đơn hàng từ cơ sở dữ liệu
    result = await db.execute(
        select(HotelBooking).filter(
            HotelBooking.id == booking_id,
            HotelBooking.user_id == current_user.id
        )
    )
    booking = result.scalars().first()

    # 2. Kiểm tra tồn tại
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy thông tin dịch vụ.")

    # 3. Logic kiểm tra thời gian (Không quá 1 tiếng)
    now = datetime.utcnow()
    # Giả định booking.created_at là kiểu datetime trong DB
    time_diff = now - booking.created_at

    if time_diff > timedelta(hours=1):
        raise HTTPException(
            status_code=400, 
            detail="Đã quá 1 giờ kể từ khi đặt, bạn không thể xóa dịch vụ này. Vui lòng liên hệ hỗ trợ."
        )

    # 4. Thực hiện xóa
    try:
        await db.delete(booking)
        await db.commit()
        return {"message": "Đã xóa dịch vụ thành công."}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Lỗi hệ thống khi xóa dữ liệu.")