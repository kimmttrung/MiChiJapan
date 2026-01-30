from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session, create_engine, select
from app.models import Location
from app.services.ai_service import generate_itinerary
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager

load_dotenv()

# 1. Cấu hình Database
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def get_session():
    with Session(engine) as session:
        yield session

@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield

# 2. KHỞI TẠO APP (Chỉ 1 lần duy nhất)
app = FastAPI(lifespan=lifespan)

# 3. CẤU HÌNH CORS (Quan trọng để sửa lỗi Access-Control-Allow-Origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Cho phép Frontend Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. ĐỊNH NGHĨA REQUEST SCHEMA
class PlanRequest(BaseModel):
    region: str
    days: int
    budget: str

# 5. ENDPOINT CHÍNH
@app.post("/plan-trip")
def plan_trip(request: PlanRequest, session: Session = Depends(get_session)):
    try:
        # Lấy data từ DB
        statement = select(Location).where(Location.region == request.region)
        db_locations = session.exec(statement).all()
        
        # Gọi service AI
        itinerary = generate_itinerary(request.region, request.days, request.budget, db_locations)
        return itinerary
    except Exception as e:
        # Trả về lỗi 500 nếu AI hoặc DB gặp vấn đề
        raise HTTPException(status_code=500, detail=str(e))