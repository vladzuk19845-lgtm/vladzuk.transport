from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import hashlib
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'transportpro-secret-key-2024')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Fondy Configuration
FONDY_MERCHANT_ID = os.environ.get('FONDY_MERCHANT_ID', '1396424')
FONDY_MERCHANT_PASSWORD = os.environ.get('FONDY_MERCHANT_PASSWORD', 'test')
FONDY_API_URL = "https://pay.fondy.eu/api"

# Create the main app
app = FastAPI(title="TransportPro API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    phone: str
    city: str
    user_type: str = "driver"  # driver or customer

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    phone: str
    city: str
    user_type: str
    created_at: str
    subscription_active: bool = False
    subscription_expires: Optional[str] = None

class VehicleCreate(BaseModel):
    vehicle_type: str  # cargo or passenger
    brand: str
    model: str
    year: int
    capacity_tons: Optional[float] = None  # for cargo
    dimensions_length: Optional[float] = None
    dimensions_width: Optional[float] = None
    dimensions_height: Optional[float] = None
    passenger_seats: Optional[int] = None  # for passenger
    description: str
    price_per_km: float
    available: bool = True
    images: List[str] = []

class VehicleResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    vehicle_type: str
    brand: str
    model: str
    year: int
    capacity_tons: Optional[float] = None
    dimensions_length: Optional[float] = None
    dimensions_width: Optional[float] = None
    dimensions_height: Optional[float] = None
    passenger_seats: Optional[int] = None
    description: str
    price_per_km: float
    available: bool
    images: List[str]
    created_at: str
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    driver_city: Optional[str] = None

class SubscriptionPackage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    name_ua: str
    description: str
    description_ua: str
    price: int  # in cents (UAH)
    duration_days: int
    features: List[str]
    features_ua: List[str]
    popular: bool = False

class PaymentCreate(BaseModel):
    package_id: str

class PaymentResponse(BaseModel):
    checkout_url: str
    order_id: str

# ============== UTILITIES ==============

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_jwt_token(user_id: str, email: str) -> str:
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    payload = verify_jwt_token(credentials.credentials)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def generate_fondy_signature(params: dict) -> str:
    """Generate SHA1 signature for Fondy"""
    filtered = {k: v for k, v in params.items() if v is not None and v != ''}
    sorted_values = [str(filtered[k]) for k in sorted(filtered.keys())]
    signature_string = FONDY_MERCHANT_PASSWORD + '|' + '|'.join(sorted_values)
    return hashlib.sha1(signature_string.encode()).hexdigest()

# ============== AUTH ROUTES ==============

@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "phone": user_data.phone,
        "city": user_data.city,
        "user_type": user_data.user_type,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "subscription_active": False,
        "subscription_expires": None
    }
    
    await db.users.insert_one(user_doc)
    
    return UserResponse(
        id=user_id,
        email=user_data.email,
        name=user_data.name,
        phone=user_data.phone,
        city=user_data.city,
        user_type=user_data.user_type,
        created_at=user_doc["created_at"],
        subscription_active=False
    )

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if user["password_hash"] != hash_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["id"], user["email"])
    
    return {
        "token": token,
        "user": UserResponse(
            id=user["id"],
            email=user["email"],
            name=user["name"],
            phone=user["phone"],
            city=user["city"],
            user_type=user["user_type"],
            created_at=user["created_at"],
            subscription_active=user.get("subscription_active", False),
            subscription_expires=user.get("subscription_expires")
        )
    }

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        name=current_user["name"],
        phone=current_user["phone"],
        city=current_user["city"],
        user_type=current_user["user_type"],
        created_at=current_user["created_at"],
        subscription_active=current_user.get("subscription_active", False),
        subscription_expires=current_user.get("subscription_expires")
    )

# ============== VEHICLE ROUTES ==============

@api_router.post("/vehicles", response_model=VehicleResponse)
async def create_vehicle(vehicle_data: VehicleCreate, current_user: dict = Depends(get_current_user)):
    # Check subscription
    if not current_user.get("subscription_active"):
        raise HTTPException(status_code=403, detail="Active subscription required to add vehicles")
    
    vehicle_id = str(uuid.uuid4())
    vehicle_doc = {
        "id": vehicle_id,
        "user_id": current_user["id"],
        "vehicle_type": vehicle_data.vehicle_type,
        "brand": vehicle_data.brand,
        "model": vehicle_data.model,
        "year": vehicle_data.year,
        "capacity_tons": vehicle_data.capacity_tons,
        "dimensions_length": vehicle_data.dimensions_length,
        "dimensions_width": vehicle_data.dimensions_width,
        "dimensions_height": vehicle_data.dimensions_height,
        "passenger_seats": vehicle_data.passenger_seats,
        "description": vehicle_data.description,
        "price_per_km": vehicle_data.price_per_km,
        "available": vehicle_data.available,
        "images": vehicle_data.images,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.vehicles.insert_one(vehicle_doc)
    
    return VehicleResponse(
        **{k: v for k, v in vehicle_doc.items() if k != "_id"},
        driver_name=current_user["name"],
        driver_phone=current_user["phone"],
        driver_city=current_user["city"]
    )

@api_router.get("/vehicles", response_model=List[VehicleResponse])
async def get_vehicles(
    vehicle_type: Optional[str] = None,
    city: Optional[str] = None,
    min_capacity: Optional[float] = None,
    max_price: Optional[float] = None,
    limit: int = Query(default=50, le=100),
    offset: int = 0
):
    # Build query
    query = {"available": True}
    if vehicle_type:
        query["vehicle_type"] = vehicle_type
    if min_capacity:
        query["capacity_tons"] = {"$gte": min_capacity}
    
    # Get vehicles with driver info
    vehicles = await db.vehicles.find(query, {"_id": 0}).skip(offset).limit(limit).to_list(limit)
    
    result = []
    for v in vehicles:
        # Get driver info
        driver = await db.users.find_one({"id": v["user_id"]}, {"_id": 0})
        if driver:
            # Filter by city if specified
            if city and city.lower() not in driver.get("city", "").lower():
                continue
            # Filter by max price
            if max_price and v.get("price_per_km", 0) > max_price:
                continue
            
            result.append(VehicleResponse(
                **v,
                driver_name=driver["name"],
                driver_phone=driver["phone"],
                driver_city=driver["city"]
            ))
    
    return result

@api_router.get("/vehicles/my", response_model=List[VehicleResponse])
async def get_my_vehicles(current_user: dict = Depends(get_current_user)):
    vehicles = await db.vehicles.find(
        {"user_id": current_user["id"]}, 
        {"_id": 0}
    ).to_list(100)
    
    return [VehicleResponse(
        **v,
        driver_name=current_user["name"],
        driver_phone=current_user["phone"],
        driver_city=current_user["city"]
    ) for v in vehicles]

@api_router.get("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(vehicle_id: str):
    vehicle = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    driver = await db.users.find_one({"id": vehicle["user_id"]}, {"_id": 0})
    
    return VehicleResponse(
        **vehicle,
        driver_name=driver["name"] if driver else None,
        driver_phone=driver["phone"] if driver else None,
        driver_city=driver["city"] if driver else None
    )

@api_router.put("/vehicles/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: str, 
    vehicle_data: VehicleCreate, 
    current_user: dict = Depends(get_current_user)
):
    vehicle = await db.vehicles.find_one({"id": vehicle_id, "user_id": current_user["id"]})
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    update_data = vehicle_data.model_dump()
    await db.vehicles.update_one(
        {"id": vehicle_id},
        {"$set": update_data}
    )
    
    updated = await db.vehicles.find_one({"id": vehicle_id}, {"_id": 0})
    return VehicleResponse(
        **updated,
        driver_name=current_user["name"],
        driver_phone=current_user["phone"],
        driver_city=current_user["city"]
    )

@api_router.delete("/vehicles/{vehicle_id}")
async def delete_vehicle(vehicle_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.vehicles.delete_one({"id": vehicle_id, "user_id": current_user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return {"message": "Vehicle deleted"}

# ============== SUBSCRIPTION PACKAGES ==============

DEFAULT_PACKAGES = [
    {
        "id": "basic",
        "name": "Basic",
        "name_ua": "Базовий",
        "description": "Perfect for getting started",
        "description_ua": "Ідеально для початку",
        "price": 29900,  # 299 UAH
        "duration_days": 30,
        "features": ["1 vehicle listing", "Basic search visibility", "Email support"],
        "features_ua": ["1 оголошення", "Базова видимість у пошуку", "Email підтримка"],
        "popular": False
    },
    {
        "id": "professional",
        "name": "Professional",
        "name_ua": "Професійний",
        "description": "Best for active drivers",
        "description_ua": "Найкраще для активних водіїв",
        "price": 59900,  # 599 UAH
        "duration_days": 30,
        "features": ["5 vehicle listings", "Priority search visibility", "Phone support", "Analytics dashboard"],
        "features_ua": ["5 оголошень", "Пріоритетна видимість", "Телефонна підтримка", "Аналітика"],
        "popular": True
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "name_ua": "Корпоративний",
        "description": "For transport companies",
        "description_ua": "Для транспортних компаній",
        "price": 149900,  # 1499 UAH
        "duration_days": 30,
        "features": ["Unlimited vehicles", "Top search placement", "24/7 support", "API access", "Custom branding"],
        "features_ua": ["Безліміт оголошень", "Топ пошуку", "Підтримка 24/7", "API доступ", "Власний брендінг"],
        "popular": False
    }
]

@api_router.get("/packages", response_model=List[SubscriptionPackage])
async def get_packages():
    return [SubscriptionPackage(**p) for p in DEFAULT_PACKAGES]

# ============== PAYMENT ROUTES (FONDY) ==============

@api_router.post("/payments/create", response_model=PaymentResponse)
async def create_payment(payment_data: PaymentCreate, current_user: dict = Depends(get_current_user)):
    # Find package
    package = next((p for p in DEFAULT_PACKAGES if p["id"] == payment_data.package_id), None)
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    
    # Prepare Fondy request
    fondy_params = {
        "order_id": order_id,
        "merchant_id": int(FONDY_MERCHANT_ID),
        "amount": package["price"],
        "currency": "UAH",
        "order_desc": f"TransportPro - {package['name']} subscription",
        "response_url": os.environ.get('FRONTEND_URL', 'http://localhost:3000') + "/payment/success",
        "server_callback_url": os.environ.get('BACKEND_URL', 'http://localhost:8001') + "/api/payments/webhook",
    }
    
    fondy_params["signature"] = generate_fondy_signature(fondy_params)
    
    # Save order to DB
    order_doc = {
        "id": order_id,
        "user_id": current_user["id"],
        "package_id": package["id"],
        "amount": package["price"],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.orders.insert_one(order_doc)
    
    # Request checkout URL from Fondy
    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.post(
                f"{FONDY_API_URL}/checkout/url",
                json={"request": fondy_params},
                timeout=30.0
            )
            data = response.json()
        
        if data.get("response", {}).get("response_status") == "success":
            return PaymentResponse(
                checkout_url=data["response"]["checkout_url"],
                order_id=order_id
            )
        else:
            error_msg = data.get("response", {}).get("error_message", "Payment initialization failed")
            raise HTTPException(status_code=400, detail=error_msg)
    except httpx.RequestError as e:
        logger.error(f"Fondy request error: {e}")
        raise HTTPException(status_code=500, detail="Payment service unavailable")

@api_router.post("/payments/webhook")
async def payment_webhook(request_data: dict):
    """Handle Fondy payment webhook"""
    response_data = request_data.get("response", {})
    order_id = response_data.get("order_id")
    order_status = response_data.get("order_status")
    
    if not order_id:
        return {"status": "error", "message": "Missing order_id"}
    
    # Find order
    order = await db.orders.find_one({"id": order_id})
    if not order:
        return {"status": "error", "message": "Order not found"}
    
    # Update order status
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": order_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # If approved, activate subscription
    if order_status == "approved":
        package = next((p for p in DEFAULT_PACKAGES if p["id"] == order["package_id"]), None)
        if package:
            expires = datetime.now(timezone.utc) + timedelta(days=package["duration_days"])
            await db.users.update_one(
                {"id": order["user_id"]},
                {"$set": {
                    "subscription_active": True,
                    "subscription_expires": expires.isoformat(),
                    "subscription_package": package["id"]
                }}
            )
    
    return {"status": "success"}

# ============== DEMO ACTIVATION ==============

@api_router.post("/demo/activate-subscription")
async def demo_activate(current_user: dict = Depends(get_current_user)):
    """Demo endpoint to activate subscription without payment (for testing)"""
    expires = datetime.now(timezone.utc) + timedelta(days=30)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {
            "subscription_active": True,
            "subscription_expires": expires.isoformat(),
            "subscription_package": "professional"
        }}
    )
    return {"message": "Demo subscription activated", "expires": expires.isoformat()}

# ============== STATISTICS ==============

@api_router.get("/stats")
async def get_stats():
    """Get platform statistics"""
    drivers_count = await db.users.count_documents({"user_type": "driver"})
    vehicles_count = await db.vehicles.count_documents({})
    cargo_count = await db.vehicles.count_documents({"vehicle_type": "cargo"})
    passenger_count = await db.vehicles.count_documents({"vehicle_type": "passenger"})
    
    return {
        "drivers": drivers_count,
        "vehicles": vehicles_count,
        "cargo_vehicles": cargo_count,
        "passenger_vehicles": passenger_count
    }

# ============== ROOT ROUTE ==============

@api_router.get("/")
async def root():
    return {"message": "TransportPro API", "version": "1.0.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
