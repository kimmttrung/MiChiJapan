from fastapi import FastAPI
from app.api import test_db, admin, users

app = FastAPI()

app.include_router(test_db.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(users.router, prefix="/api")