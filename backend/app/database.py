from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import certifi
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize client and db globally
client = None
db = None

# Initialize collection variables
users_collection = None
transactions_collection = None
budgets_collection = None
accounts_collection = None
goals_collection = None
habits_collection = None
budget_settings_collection = None # Make sure this matches what you use

try:
    # Connect immediately
    client = AsyncIOMotorClient(
        settings.DATABASE_URL,
        tlsCAFile=certifi.where(),
        serverSelectionTimeoutMS=5000,
        tlsAllowInvalidCertificates=True
    )
    
    db = client[settings.DB_NAME]

    # Assign collections immediately
    users_collection = db.get_collection("users")
    transactions_collection = db.get_collection("transactions")
    budgets_collection = db.get_collection("budgets")
    accounts_collection = db.get_collection("accounts")
    goals_collection = db.get_collection("goals")
    habits_collection = db.get_collection("habits")
    budget_settings_collection = db.get_collection("budget_settings")

    logger.info("✅ MongoDB Client initialized")

except Exception as e:
    logger.error(f"❌ Failed to initialize MongoDB client: {e}")
    # Don't crash here, let main.py handle startup check
