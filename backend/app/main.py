from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, transactions, ai, accounts, goals, budget, habits  
from app.database import client 
import logging
import uvicorn

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RupeeRiser API")

# ✅ FIXED CORS CONFIGURATION
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "https://rupeeraiser.vercel.app", # Your Vercel URL
        "*" 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Test DB Connection on Startup ---
@app.on_event("startup")
async def startup_db_client():
    try:
        logger.info("⏳ Attempting to connect to MongoDB Atlas...")
        await client.admin.command('ping')
        logger.info("✅ SUCCESS: Connected to MongoDB Atlas!")
    except Exception as e:
        logger.error(f"❌ FAILURE: Could not connect to MongoDB. Error: {e}")
        logger.error("👉 TIP: If you are on Office/College WiFi, switch to Mobile Hotspot. Port 27017 might be blocked.")
# ------------------------------------------

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(ai.router)
app.include_router(accounts.router)
app.include_router(goals.router)
app.include_router(budget.router)
app.include_router(habits.router) 

@app.get("/")
def read_root():
    return {"message": "RupeeRiser API is running 🚀"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)