from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import certifi
import logging
import os

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 1. Get Connection String
MONGO_URL = os.getenv("DATABASE_URL") or settings.DATABASE_URL

# 2. Define Global Variables (Initialize as None)
client = None
db = None
users_collection = None
transactions_collection = None
budgets_collection = None
accounts_collection = None
goals_collection = None
habits_collection = None
budget_settings_collection = None

# 3. Attempt Connection
if not MONGO_URL:
    logger.error("❌ CRITICAL: DATABASE_URL is missing in Environment Variables!")
else:
    try:
        logger.info("⏳ Connecting to MongoDB...")
        
        # Connect
        client = AsyncIOMotorClient(
            MONGO_URL,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            tlsAllowInvalidCertificates=True
        )
        
        # Check connection immediately
        client.admin.command('ping')
        logger.info("✅ MongoDB Connected Successfully!")

        # Assign DB and Collections
        db = client[settings.DB_NAME]
        users_collection = db.get_collection("users")
        transactions_collection = db.get_collection("transactions")
        budgets_collection = db.get_collection("budgets")
        accounts_collection = db.get_collection("accounts")
        goals_collection = db.get_collection("goals")
        habits_collection = db.get_collection("habits")
        budget_settings_collection = db.get_collection("budget_settings")

    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
