from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import certifi
import logging

# Set up logging to see DB errors in terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global client variable
client = None
db = None

# Define collections globally (initially None)
users_collection = None
transactions_collection = None
budgets_collection = None
accounts_collection = None
goals_collection = None
habits_collection = None
budget_settings_collection = None # Added this one explicitly

try:
    # Attempt to connect
    client = AsyncIOMotorClient(
        settings.DATABASE_URL,
        tlsCAFile=certifi.where(), 
        serverSelectionTimeoutMS=5000, 
        tlsAllowInvalidCertificates=True 
    )
    
    db = client[settings.DB_NAME]

    # Initialize collections
    users_collection = db.get_collection("users")
    transactions_collection = db.get_collection("transactions")
    budgets_collection = db.get_collection("budgets")
    accounts_collection = db.get_collection("accounts")
    goals_collection = db.get_collection("goals")
    habits_collection = db.get_collection("habits")
    budget_settings_collection = db.get_collection("budget_settings") # Ensure this exists

    logger.info("✅ MongoDB Client initialized (Lazy connection)")

except Exception as e:
    logger.error(f"❌ Failed to initialize MongoDB client: {e}")