# database.py
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
import certifi
import logging

# Set up logging to see DB errors in terminal
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    # Attempt to connect with specific SSL settings for Windows
    client = AsyncIOMotorClient(
        settings.DATABASE_URL,
        tlsCAFile=certifi.where(), # Use updated certificates
        serverSelectionTimeoutMS=5000, # 5 second timeout
        # Uncomment the line below if you are on a restricted network (Corporate/College wifi)
        tlsAllowInvalidCertificates=True 
    )
    
    db = client[settings.DB_NAME]

    # specific collections
    users_collection = db.get_collection("users")
    transactions_collection = db.get_collection("transactions")
    budgets_collection = db.get_collection("budgets")
    accounts_collection = db.get_collection("accounts")
    goals_collection = db.get_collection("goals")
    habits_collection = db.get_collection("habits")

    logger.info("MongoDB Client initialized (Lazy connection)")

except Exception as e:
    logger.error(f"Failed to initialize MongoDB client: {e}")