from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from app.database import transactions_collection
from app.models import TransactionCreate, TransactionResponse
from app.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/", response_model=List[TransactionResponse])
async def get_transactions(
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    type: Optional[str] = None
):
    query = {"user_id": str(current_user["_id"])}
    if type:
        query["type"] = type
        
    cursor = transactions_collection.find(query).sort("date", -1).limit(limit)
    transactions = []
    async for tx in cursor:
        tx["id"] = str(tx["_id"])
        transactions.append(tx)
    return transactions

@router.post("/", response_model=TransactionResponse)
async def create_transaction(tx: TransactionCreate, current_user: dict = Depends(get_current_user)):
    tx_data = tx.dict()
    tx_data["user_id"] = str(current_user["_id"])
    
    new_tx = await transactions_collection.insert_one(tx_data)
    created_tx = await transactions_collection.find_one({"_id": new_tx.inserted_id})
    created_tx["id"] = str(created_tx["_id"])
    return created_tx

# ADD THIS PUT ENDPOINT
@router.put("/{tx_id}", response_model=TransactionResponse)
async def update_transaction(tx_id: str, tx: TransactionCreate, current_user: dict = Depends(get_current_user)):
    # Convert string ID to ObjectId
    try:
        obj_id = ObjectId(tx_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    tx_data = tx.dict()
    tx_data["user_id"] = str(current_user["_id"])

    # Perform update
    result = await transactions_collection.update_one(
        {"_id": obj_id, "user_id": str(current_user["_id"])},
        {"$set": tx_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Return updated document
    updated_tx = await transactions_collection.find_one({"_id": obj_id})
    updated_tx["id"] = str(updated_tx["_id"])
    return updated_tx

@router.delete("/{tx_id}")
async def delete_transaction(tx_id: str, current_user: dict = Depends(get_current_user)):
    result = await transactions_collection.delete_one({"_id": ObjectId(tx_id), "user_id": str(current_user["_id"])})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Deleted successfully"}