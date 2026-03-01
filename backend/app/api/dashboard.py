from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.dependencies import get_current_user, get_current_admin
router = APIRouter()

@router.get("/admin/stats/overview")
async def get_admin_stats(db: AsyncSession = Depends(get_db), admin=Depends(get_current_admin)):
    try:
        # 1. Thống kê số lượng tổng quát (Counters)
        count_sql = text("""
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM hotels) as total_hotels,
                (SELECT COUNT(*) FROM restaurants) as total_restaurants,
                (SELECT COUNT(*) FROM trips) as total_trips,
                (SELECT SUM(total_amount) FROM hotel_bookings WHERE status != 'cancelled') as total_revenue
            """)
        count_res = await db.execute(count_sql)
        counts = count_res.fetchone()

        # 2. Dữ liệu biểu đồ tròn: Chuyến đi theo vùng (Regions)
        region_sql = text("""
            SELECT r.name, COUNT(t.id) as trip_count
            FROM regions r
            LEFT JOIN trips t ON r.id = t.region_id
            GROUP BY r.name
            ORDER BY trip_count DESC
        """)
        region_res = await db.execute(region_sql)
        region_data = [{"name": row.name, "value": row.trip_count} for row in region_res.fetchall()]

      # 3. Dữ liệu biểu đồ đường: Doanh thu theo NGÀY (30 ngày gần nhất)
        revenue_sql = text("""
            SELECT 
                TO_CHAR(created_at, 'DD/MM') as date_label,
                SUM(total_amount) as daily_revenue
            FROM hotel_bookings
            WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
              AND status != 'cancelled'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD'), TO_CHAR(created_at, 'DD/MM')
            ORDER BY TO_CHAR(created_at, 'YYYY-MM-DD') ASC
        """)
        revenue_res = await db.execute(revenue_sql)
        # format lại dữ liệu để Recharts dễ đọc
        revenue_growth = [{"date": row.date_label, "revenue": row.daily_revenue or 0} for row in revenue_res.fetchall()]

        return {
            "summary": {
                "users": counts.total_users,
                "hotels": counts.total_hotels,
                "restaurants": counts.total_restaurants,
                "trips": counts.total_trips,
                "revenue": counts.total_revenue or 0
            },
            "region_distribution": region_data,
            "revenue_growth": revenue_growth
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))