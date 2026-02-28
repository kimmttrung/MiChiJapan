from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import users, auth, regions, hotels, restaurants, cuisines, place, trip, destinations, booking # Import auth mới

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
app.include_router(regions.router, prefix="/api", tags=["Regions"])
app.include_router(hotels.router, prefix="/api", tags=["Hotels"])
app.include_router(restaurants.router, prefix="/api", tags=["Restaurants"])
app.include_router(cuisines.router, prefix="/api", tags=["Cuisines"])
app.include_router(place.router, prefix="/api", tags=["Places"])
app.include_router(trip.router, prefix="/api/v1", tags=["Trips"])
app.include_router(destinations.router, prefix="/api/destinations", tags=["destinations"]) 
app.include_router(booking.router, prefix="/api/bookings", tags=["Bookings"]) 
