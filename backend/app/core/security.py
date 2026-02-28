# import os
# import bcrypt
# from datetime import datetime, timedelta
# from jose import jwt
# from dotenv import load_dotenv

# # Load các biến môi trường từ file .env
# load_dotenv()

# # Đọc cấu hình từ .env (có kèm giá trị mặc định để tránh lỗi)
# SECRET_KEY = os.getenv("SECRET_KEY", "default_secret_key_if_not_found")
# ALGORITHM = os.getenv("ALGORITHM", "HS256")
# # Chuyển đổi phút sang kiểu số nguyên (int)
# ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# def hash_password(password: str) -> str:
#     hashed = bcrypt.hashpw(
#         password.encode("utf-8"),
#         bcrypt.gensalt()
#     )
#     return hashed.decode("utf-8")

# def verify_password(password: str, hashed: str) -> bool:
#     try:
#         return bcrypt.checkpw(
#             password.encode("utf-8"),
#             hashed.encode("utf-8")
#         )
#     except Exception:
#         return False

# # --- XỬ LÝ JWT TOKEN ---
# def create_access_token(data: dict):
#     """Tạo mã Token để gửi về cho người dùng sau khi đăng nhập"""
#     to_encode = data.copy()
    
#     # Tính thời gian hết hạn
#     expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
#     # Thêm thông tin hết hạn vào payload của token
#     to_encode.update({"exp": expire})
    
#     # Mã hóa chuỗi Token bằng SECRET_KEY
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
#     return encoded_jwt

import bcrypt
from datetime import datetime, timedelta
from jose import jwt, JWTError

from app.core.config import settings


# =========================
# PASSWORD
# =========================

def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    )
    return hashed.decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hashed.encode("utf-8")
        )
    except Exception:
        return False


# =========================
# JWT TOKEN
# =========================

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


def decode_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        return None