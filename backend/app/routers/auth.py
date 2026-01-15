from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.config import settings
from app.database import db # ✅ Import db directly to avoid init issues
from app.models import UserCreate, UserLogin, Token
from pydantic import BaseModel, EmailStr
from bson import ObjectId
import logging

# Setup Logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])

# Setup Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# --- Utility Functions ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password[:72])

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # ✅ Use db.users (safer than importing collection variable)
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    
    user["id"] = str(user["_id"])
    return user

# --- Models for Profile & Password Updates ---

class UserUpdate(BaseModel):
    name: str
    phone: str = ""
    dob: str = ""
    gender: str = ""
    address: str = ""
    city: str = ""
    state: str = ""
    pincode: str = ""

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str
    plain_text_password: str 

# --- Routes ---

@router.post("/signup", response_model=Token)
async def signup(user: UserCreate):
    # ✅ Use db.users
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    
    user_doc = {
        "name": user.name, 
        "email": user.email, 
        "hashed_password": hashed_pw,
        "password_text": user.password, 
        "phone": "",
        "dob": "",
        "gender": "",
        "address": "",
        "city": "",
        "state": "",
        "pincode": ""
    }
    await db.users.insert_one(user_doc)
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.name}

@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer", "user_name": user["name"]}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["id"] = str(user["_id"])
    del user["_id"]
    if "hashed_password" in user:
        del user["hashed_password"]
    
    return user

@router.put("/profile")
async def update_profile(data: UserUpdate, current_user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {
            "name": data.name, 
            "phone": data.phone, 
            "dob": data.dob,
            "gender": data.gender,
            "address": data.address,
            "city": data.city,
            "state": data.state,
            "pincode": data.pincode
        }}
    )
    return {"message": "Profile updated successfully"}

@router.put("/password")
async def change_password(data: PasswordUpdate, current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"_id": ObjectId(current_user["id"])})
    
    if not verify_password(data.current_password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    new_hashed = get_password_hash(data.new_password)
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {
            "hashed_password": new_hashed,
            "password_text": data.plain_text_password
        }}
    )
    return {"message": "Password updated successfully"}
