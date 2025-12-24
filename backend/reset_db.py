import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

async def reset_database():
    print("🗑️  Connecting to Database...")
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DB_NAME]
    
    # List of collections to clear
    collections = ["users", "transactions", "budgets"]
    
    for col in collections:
        await db[col].delete_many({})
        print(f"✅ Cleared collection: {col}")
        
    print("\n✨ Database is now empty! You can start fresh.")

if __name__ == "__main__":
    asyncio.run(reset_database())