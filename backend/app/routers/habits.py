from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.database import db
from app.models import HabitCreate, HabitResponse
from app.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/habits", tags=["Habits"])

@router.get("/", response_model=List[HabitResponse])
async def get_habits(current_user: dict = Depends(get_current_user)):
    cursor = db.habits.find({"user_id": str(current_user["_id"])})
    habits = []
    async for h in cursor:
        h["id"] = str(h["_id"])
        habits.append(h)
    return habits

@router.post("/", response_model=HabitResponse)
async def create_habit(habit: HabitCreate, current_user: dict = Depends(get_current_user)):
    data = habit.dict()
    data["user_id"] = str(current_user["_id"])
    data["completed_dates"] = []
    res = await db.habits.insert_one(data)
    data["id"] = str(res.inserted_id)
    return data

@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(habit_id: str, habit: dict, current_user: dict = Depends(get_current_user)):
    # habit is dict with optional name and completed_dates
    update_data = {k: v for k, v in habit.items() if v is not None}
    res = await db.habits.update_one(
        {"_id": ObjectId(habit_id), "user_id": str(current_user["_id"])},
        {"$set": update_data}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    updated = await db.habits.find_one({"_id": ObjectId(habit_id)})
    updated["id"] = str(updated["_id"])
    return updated

@router.delete("/{habit_id}")
async def delete_habit(habit_id: str, current_user: dict = Depends(get_current_user)):
    res = await db.habits.delete_one({"_id": ObjectId(habit_id), "user_id": str(current_user["_id"])})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Habit not found")
    return {"message": "Deleted"}