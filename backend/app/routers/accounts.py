from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.database import db
from pydantic import BaseModel
from app.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/accounts", tags=["Accounts"])

class AccountCreate(BaseModel):
    name: str
    type: str
    balance: float

class AccountResponse(AccountCreate):
    id: str

@router.get("/", response_model=List[AccountResponse])
async def get_accounts(current_user: dict = Depends(get_current_user)):
    # Fetch accounts belonging to the logged-in user
    cursor = db.accounts.find({"user_id": str(current_user["_id"])})
    accounts = []
    async for acc in cursor:
        acc["id"] = str(acc["_id"])
        accounts.append(acc)
    return accounts

@router.post("/", response_model=AccountResponse)
async def create_account(account: AccountCreate, current_user: dict = Depends(get_current_user)):
    acc_data = account.dict()
    acc_data["user_id"] = str(current_user["_id"])
    
    new_acc = await db.accounts.insert_one(acc_data)
    created_acc = await db.accounts.find_one({"_id": new_acc.inserted_id})
    
    # Convert ObjectId to string for response
    created_acc["id"] = str(created_acc["_id"])
    return created_acc

@router.delete("/{account_id}")
async def delete_account(account_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.accounts.delete_one({
        "_id": ObjectId(account_id),
        "user_id": str(current_user["_id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
        
    return {"message": "Account deleted"}