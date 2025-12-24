# from fastapi import APIRouter, Depends, HTTPException
# from app.database import db
# from pydantic import BaseModel
# from app.auth import get_current_user
# from typing import Optional

# router = APIRouter(prefix="/budget", tags=["Budget"])

# class FixedCosts(BaseModel):
#     rent: float = 0
#     travel: float = 0
#     phone: float = 0
#     subscriptions: float = 0

# class BudgetSettings(BaseModel):
#     salary: float = 0
#     fixed_costs: FixedCosts

# @router.get("/", response_model=BudgetSettings)
# async def get_budget_settings(current_user: dict = Depends(get_current_user)):
#     # Try to find settings for this user
#     settings = await db.budget_settings.find_one({"user_id": str(current_user["_id"])})
    
#     if not settings:
#         # Return defaults if not found
#         return {
#             "salary": 0,
#             "fixed_costs": {"rent": 0, "travel": 0, "phone": 0, "subscriptions": 0}
#         }
    
#     return settings

# @router.put("/")
# async def update_budget_settings(settings: BudgetSettings, current_user: dict = Depends(get_current_user)):
#     data = settings.dict()
#     data["user_id"] = str(current_user["_id"])
    
#     # Upsert (Update if exists, Insert if not)
#     await db.budget_settings.update_one(
#         {"user_id": str(current_user["_id"])},
#         {"$set": data},
#         upsert=True
#     )
#     return {"message": "Budget settings updated"}
from fastapi import APIRouter, Depends, HTTPException
from app.database import db
from app.models import BudgetSettings
from app.auth import get_current_user

router = APIRouter(prefix="/budget", tags=["Budget"])

@router.get("/", response_model=BudgetSettings)
async def get_budget_settings(current_user: dict = Depends(get_current_user)):
    settings = await db.budget_settings.find_one({"user_id": str(current_user["_id"])})
    
    if not settings:
        return {
            "salary": 0,
            "fixed_costs": {"rent": 0, "travel": 0, "phone": 0, "subscriptions": 0}
        }
    
    return settings

@router.put("/")
async def update_budget_settings(settings: BudgetSettings, current_user: dict = Depends(get_current_user)):
    data = settings.dict()
    data["user_id"] = str(current_user["_id"])
    
    await db.budget_settings.update_one(
        {"user_id": str(current_user["_id"])},
        {"$set": data},
        upsert=True
    )
    return {"message": "Budget settings updated"}