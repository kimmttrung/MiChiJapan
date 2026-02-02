from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import users, auth # Import auth mới

app = FastAPI()

# QUAN TRỌNG: Cấu hình CORS để Next.js gọi được API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api", tags=["Auth"])
app.include_router(users.router, prefix="/api", tags=["Users"])