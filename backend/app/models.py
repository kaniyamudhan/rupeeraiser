# # models.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Literal

# --- Auth Schemas ---
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str

# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    amount: float
    category: str = "Other"
    note: str
    date: str  # YYYY-MM-DD
    type: Literal["income", "expense"]
    account: str = "wallet" 

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: str
    user_id: str

# --- Budget & Goals Schemas ---
class FixedCosts(BaseModel):
    rent: float = 0
    travel: float = 0
    phone: float = 0
    subscriptions: float = 0

class BudgetSettings(BaseModel):
    salary: float = 0
    fixed_costs: FixedCosts
    config: str = ""

class GoalCreate(BaseModel):
    name: str
    amount: float

class GoalResponse(GoalCreate):
    id: str

# --- Habits Schemas ---
class HabitCreate(BaseModel):
    name: str

class HabitResponse(HabitCreate):
    id: str
    completed_dates: List[str] = []

# --- AI Schemas ---
class NaturalLanguageInput(BaseModel):
    text: str

class BudgetProfile(BaseModel):
    salary: float
    fixed_costs: dict  
    goals: List[dict]
    current_spending: Optional[float] = 0
    spending_summary: Optional[dict] = {}
    user_context: Optional[str] = ""
    period_context: Optional[str] = ""

class ChatInput(BaseModel):
    message: str

# --- Habit Schemas ---
class HabitCreate(BaseModel):
    name: str

class HabitUpdate(BaseModel):
    name: Optional[str]
    completed_dates: Optional[List[str]]

class HabitResponse(HabitCreate):
    id: str
    completed_dates: List[str] = []
    
    
# models.py - Update these sections

class UserProfileUpdate(BaseModel):  # Create or update this model
    name: str
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None

class PasswordChange(BaseModel): # Add this for the password update
    current_password: str
    new_password: str
    plain_text_password: Optional[str] = None