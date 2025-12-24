from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.database import db
from app.models import GoalCreate, GoalResponse
from app.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/goals", tags=["Goals"])

@router.get("/", response_model=List[GoalResponse])
async def get_goals(current_user: dict = Depends(get_current_user)):
    cursor = db.goals.find({"user_id": str(current_user["_id"])})
    goals = []
    async for g in cursor:
        g["id"] = str(g["_id"])
        goals.append(g)
    return goals

@router.post("/", response_model=GoalResponse)
async def create_goal(goal: GoalCreate, current_user: dict = Depends(get_current_user)):
    data = goal.dict()
    data["user_id"] = str(current_user["_id"])
    res = await db.goals.insert_one(data)
    data["id"] = str(res.inserted_id)
    return data

@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, current_user: dict = Depends(get_current_user)):
    res = await db.goals.delete_one({"_id": ObjectId(goal_id), "user_id": str(current_user["_id"])})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Goal not found")
    return {"message": "Deleted"}