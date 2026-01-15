from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import certifi
import logging
import os

# Set up logging to see DB errors in terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global variables
client = None
db = None

# Initialize collections as None to prevent import errors
users_collection = None
transactions_collection = None
budgets_collection = None
accounts_collection = None
goals_collection = None
habits_collection = None
budget_settings_collection = None

# MongoDB Connection String from Env
MONGO_URL = os.getenv("DATABASE_URL") or settings.DATABASE_URL

try:
    if not MONGO_URL:
        logger.error("❌ CRITICAL: DATABASE_URL is missing!")
    else:
        logger.info(f"⏳ Connecting to MongoDB...")
        
        # Connect to MongoDB
        client = AsyncIOMotorClient(
            MONGO_URL,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            tlsAllowInvalidCertificates=True
        )
        
        # Get Database Name
        db_name = settings.DB_NAME if settings.DB_NAME else "rupeeriser"
        db = client[db_name]

        # Initialize collections
        users_collection = db.get_collection("users")
        transactions_collection = db.get_collection("transactions")
        budgets_collection = db.get_collection("budgets")
        accounts_collection = db.get_collection("accounts")
        goals_collection = db.get_collection("goals")
        habits_collection = db.get_collection("habits")
        budget_settings_collection = db.get_collection("budget_settings")

        logger.info("✅ MongoDB Client initialized successfully")

except Exception as e:
    logger.error(f"❌ Failed to initialize MongoDB client: {e}")
