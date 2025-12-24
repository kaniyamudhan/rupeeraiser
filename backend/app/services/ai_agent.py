from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from app.config import settings
from datetime import datetime, timedelta
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- ✅ AI INIT (MODEL UPGRADED) ----------------

llm = ChatGoogleGenerativeAI(
    model="models/gemini-2.5-flash",   # ✅ HIGH QUOTA + STABLE
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.0,
    max_retries=0,
    convert_system_message_to_human=True
)

# ---------------- ✅ SAFE MATCHER (NO FUZZY BUGS) ----------------

def safe_contains(text, words):
    for word in words:
        if re.search(rf"\b{re.escape(word)}\b", text):
            return True
    return False

# ---------------- ✅ MANUAL FALLBACK (PRODUCTION GRADE) ----------------

def manual_parse(text: str):
    logger.info(f"⚠️ Manual fallback used for: {text}")
    text_lower = text.lower()

    # ---------- 1. AMOUNT EXTRACTION ----------
    amount = 0.0
    k_match = re.search(r'(\d+(\.\d+)?)k', text_lower)
    if k_match:
        amount = float(k_match.group(1)) * 1000
    else:
        num_match = re.search(r'\b\d+(\.\d+)?\b', text_lower)
        if num_match:
            amount = float(num_match.group(0))

    # ---------- 2. CATEGORY KEYWORDS (EXPANDED + TYPOS) ----------

    food = [
        'rice','ricee','raice','raw rice','basmati','sona masoori',
        'milk','milkk','curd','butter','paneer',
        'egg','eggs','chicken','mutton','fish',
        'biryani','briyani','dosa','idli','chapati','roti',
        'poori','parotta','pongal','noodles','fried rice',
        'tea','coffee','cooldrink','cool drink','juice','water',
        'banana','apple','orange','mango','grapes',
        'onion','tomato','potato','brinjal','carrot','beans','cabbage',
        'oil','sunflower oil','groundnut oil','ghee',
        'salt','sugar','jaggery',
        'swiggy','zomato',
        'grocery','kirana','dmart','d mart','ration','store','market',
        'restaurant','cafe','hotel','bar'
    ]

    transport = [
        'bus','train','auto','ola','uber','metro','rapido',
        'fuel','petrol','diesel',
        'bike','car','trip','travel','ticket','flight'
    ]

    health = [
        'doctor','hospital','medicine','tablet','gym','protein',
        'checkup','medical','pharmacy','yoga','workout'
    ]

    entertainment = [
        'movie','cinema','netflix','prime','spotify',
        'hotstar','game','gaming','party'
    ]

    shopping = [
        'shopping','amazon','flipkart','myntra','ajio',
        'dress','shirt','pant','jeans','shoe','watch','bag'
    ]

    salary_words = [
        'salary','credited','credit','bonus','refund',
        'cashback','income','profit','stipend','received'
    ]

    category = "Other"

    if safe_contains(text_lower, food):
        category = "Food"
    elif safe_contains(text_lower, transport):
        category = "Transport"
    elif safe_contains(text_lower, health):
        category = "Health"
    elif safe_contains(text_lower, entertainment):
        category = "Entertainment"
    elif safe_contains(text_lower, shopping):
        category = "Shopping"
    elif safe_contains(text_lower, salary_words):
        category = "Salary"

    # ---------- 3. ✅ HARD TYPE LOCK (NO MORE RICE→INCOME BUG) ----------

    tx_type = "expense"   # ✅ DEFAULT ALWAYS EXPENSE

    if safe_contains(text_lower, salary_words):
        tx_type = "income"
        category = "Salary"

    # ✅ ABSOLUTE OVERRIDE — THESE CAN NEVER BE INCOME
    if category in ["Food", "Transport", "Health", "Entertainment", "Shopping"]:
        tx_type = "expense"

    # ---------- 4. ✅ DATE PARSER (EXPANDED) ----------

    date_str = datetime.now().strftime("%Y-%m-%d")

    if any(x in text_lower for x in ['tdy','today']):
        pass
    elif any(x in text_lower for x in ['ystd','yesterday']):
        date_str = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    elif any(x in text_lower for x in ['tmrw','tomorrow']):
        date_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    elif any(x in text_lower for x in ['day after','day after tomorrow']):
        date_str = (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d")
    elif 'next week' in text_lower:
        date_str = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
    elif 'next month' in text_lower:
        date_str = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")

    # ---------- 5. ✅ CLEAN NOTE ----------

    clean_note = re.sub(r'\b\d+(\.\d+)?k?\b', '', text)
    clean_note = re.sub(
        r'\b(rs|rupees|for|on|in|at|tdy|today|tmrw|tomorrow|yesterday)\b',
        '',
        clean_note,
        flags=re.I
    )
    clean_note = re.sub(r'[₹$.]', '', clean_note)
    clean_note = " ".join(clean_note.split()).title()

    if not clean_note:
        clean_note = category

    return {
        "amount": amount,
        "category": category,
        "note": clean_note,
        "date": date_str,
        "type": tx_type,
        "account": "wallet"
    }

# ---------------- ✅ AI PARSER (UNCHANGED LOGIC, NEW MODEL) ----------------

async def parse_expense_text(text: str):
    today = datetime.now().strftime("%Y-%m-%d")

    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Extract JSON: amount, category, note, date (YYYY-MM-DD), type (expense/income), account."),
            ("human", f"Current Date: {today}. Text: {text}")
        ])
        
        chain = prompt | llm | JsonOutputParser()
        result = await chain.ainvoke({})

        if not result or result.get('amount') == 0:
            raise ValueError("Empty AI result")

        return result

    except Exception:
        return manual_parse(text)

# ---------------- ✅ BUDGET PLAN (UNCHANGED) ----------------

async def generate_budget_plan(salary, fixed, goals, spending_summary="", user_context=""):
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Financial advisor. Return JSON."),
            ("human", f"Salary: {salary}, Fixed: {fixed}, Goals: {goals}")
        ])
        chain = prompt | llm | JsonOutputParser()
        return await chain.ainvoke({})
    except Exception:
        return None

# ---------------- ✅ CHAT BOT (UNCHANGED) ----------------

async def chat_with_finance_bot(message: str, context_data: str = ""):
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are RupeeRiser AI."),
            ("human", f"Context: {context_data}. User: {message}")
        ])
        chain = prompt | llm
        res = await chain.ainvoke({})
        return res.content
    except Exception:
        return "AI busy. Try again later."
