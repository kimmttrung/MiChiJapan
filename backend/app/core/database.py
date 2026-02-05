# app/core/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    
    # Cấu hình Pool đơn giản, hiệu quả
    pool_pre_ping=True, 
    pool_size=10,
    max_overflow=20,
    pool_recycle=300,
    
    # Psycopg không cần cấu hình phức tạp như asyncpg
    # Nếu kết nối Neon cần SSL, nó tự động nhận diện qua URL
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()