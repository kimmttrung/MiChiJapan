from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import datetime

from app.core.database import get_db
from app.models.restaurant import Restaurant, RestaurantBooking,RestaurantCuisine # Giả định bạn đã tạo model này
from app.schemas.restaurant_booking import (
    RestBookingCreate, 
    RestBookingResponse, 
    MyRestBookingResponse, 
    AdminRestBookingResponse
)
from app.dependencies import get_current_user, get_current_admin

router = APIRouter()

# --- 1. USER ĐẶT BÀN ---
@router.post("/", response_model=RestBookingResponse)
async def book_restaurant(
    booking: RestBookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Kiểm tra nhà hàng có tồn tại không
    result = await db.execute(
        select(Restaurant).filter(Restaurant.id == booking.restaurant_id)
    )
    restaurant = result.scalars().first()

    if not restaurant:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhà hàng")

    # Kiểm tra trạng thái hoạt động của nhà hàng
    if not restaurant.is_active:
        raise HTTPException(status_code=400, detail="Nhà hàng hiện đang tạm nghỉ")

    # Tạo đơn đặt bàn mới
    new_booking = RestaurantBooking(
        restaurant_id=booking.restaurant_id,
        user_id=current_user.id,
        guest_full_name=booking.guest_full_name,
        guest_email=booking.guest_email,
        guest_phone=booking.guest_phone,
        booking_date=booking.booking_date,
        booking_time=booking.booking_time,
        guests=booking.guests,
        special_request=booking.special_request,
        status="pending"
    )

    db.add(new_booking)
    await db.commit()
    await db.refresh(new_booking)

    return new_booking

# --- 2. USER XEM LỊCH SỬ ĐẶT BÀN ---
@router.get("/my-bookings", response_model=list[MyRestBookingResponse])
async def my_restaurant_bookings(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(RestaurantBooking)
        .options(selectinload(RestaurantBooking.restaurant))
        .filter(RestaurantBooking.user_id == current_user.id)
        .order_by(RestaurantBooking.booking_date.desc())
    )
    return result.scalars().all()

# --- 3. ADMIN XEM TẤT CẢ ĐƠN ĐẶT BÀN ---
@router.get("/all", response_model=list[AdminRestBookingResponse])
async def get_all_rest_bookings_admin(
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    result = await db.execute(
        select(RestaurantBooking)
        .options(
            selectinload(RestaurantBooking.restaurant),
            selectinload(RestaurantBooking.user)
        )
        .order_by(RestaurantBooking.created_at.desc())
    )
    return result.scalars().all()

# --- 4. ADMIN PHÊ DUYỆT ĐƠN ---
@router.patch("/{booking_id}/approve")
async def approve_rest_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    result = await db.execute(
        select(RestaurantBooking).filter(RestaurantBooking.id == booking_id)
    )
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn đặt bàn")
    
    if booking.status != "pending":
        raise HTTPException(status_code=400, detail="Chỉ có thể phê duyệt đơn ở trạng thái chờ")

    booking.status = "confirmed"
    await db.commit()
    return {"message": "Đã xác nhận đặt bàn"}

# --- 5. ADMIN/USER HỦY ĐƠN ---
@router.patch("/{booking_id}/cancel")
async def cancel_rest_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(
        select(RestaurantBooking).filter(RestaurantBooking.id == booking_id)
    )
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn đặt bàn")

    # Nếu là user thường, chỉ được hủy đơn của chính mình
    if not current_user.is_admin and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Không có quyền hủy đơn này")

    booking.status = "cancelled"
    await db.commit()
    return {"message": "Đã hủy đơn đặt bàn"}

# --- 6. XÓA ĐƠN ---
@router.delete("/{booking_id}")
async def delete_rest_booking(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    admin = Depends(get_current_admin)
):
    result = await db.execute(
        select(RestaurantBooking).filter(RestaurantBooking.id == booking_id)
    )
    booking = result.scalars().first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn")

    await db.delete(booking)
    await db.commit()
    return {"message": "Đã xóa đơn đặt bàn"}

# --- 7. XEM CHI TIẾT MỘT ĐƠN ĐẶT BÀN ---
@router.get("/{booking_id}", response_model=AdminRestBookingResponse)
async def get_booking_detail(
    booking_id: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Truy vấn đầy đủ: Đơn đặt + Nhà hàng + Thực đơn (cuisines_data) + Tên món (cuisine)
    query = (
        select(RestaurantBooking)
        .where(RestaurantBooking.id == booking_id)
        .options(
            selectinload(RestaurantBooking.restaurant)
                .selectinload(Restaurant.cuisines_data)
                .selectinload(RestaurantCuisine.cuisine),
            selectinload(RestaurantBooking.user)
        )
    )
    
    result = await db.execute(query)
    booking = result.scalars().first()

    if not booking:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn đặt bàn")

    # Bảo mật: Chỉ chủ đơn hoặc Admin mới được xem
    if current_user.role != "admin" and booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xem thông tin này")

    return booking