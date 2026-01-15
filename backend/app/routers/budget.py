from fastapi import APIRouter, Depends, HTTPException
from app.database import db
from app.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/budget", tags=["Budget"])

# --- 1. DEFINE MODELS HERE (To ensure 'config' exists) ---

class FixedCosts(BaseModel):
    rent: float = 0
    travel: float = 0
    phone: float = 0        # Used for "Others Total" in frontend
    subscriptions: float = 0 # Used for "Home/Parents" in frontend

class BudgetSettings(BaseModel):
    salary: float = 0
    fixed_costs: FixedCosts
    # ✅ CRITICAL: This field stores the JSON string for Mobile/Laptop sync
    config: Optional[str] = "" 

# ---------------------------------------------------------

@router.get("/", response_model=BudgetSettings)
async def get_budget_settings(current_user: dict = Depends(get_current_user)):
    """
    Fetch the user's budget settings.
    If no settings exist, return default values to prevent app crash.
    """
    settings = await db.budget_settings.find_one({"user_id": str(current_user["_id"])})
    
    if not settings:
        # Return defaults if user is new
        return {
            "salary": 0,
            "fixed_costs": {
                "rent": 0, 
                "travel": 0, 
                "phone": 0, 
                "subscriptions": 0
            },
            "config": ""
        }
    
    return settings

@router.put("/")
async def update_budget_settings(settings: BudgetSettings, current_user: dict = Depends(get_current_user)):
    """
    Update budget settings.
    This saves Salary, Fixed Costs, and the 'config' string (for sync).
    """
    data = settings.dict()
    data["user_id"] = str(current_user["_id"])
    
    # Upsert: Update if exists, Insert if not
    result = await db.budget_settings.update_one(
        {"user_id": str(current_user["_id"])},
        {"$set": data},
        upsert=True
    )
    
    return {"message": "Budget settings updated successfully"}