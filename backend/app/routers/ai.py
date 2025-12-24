from fastapi import APIRouter, Depends, HTTPException
from app.services.ai_agent import (
    parse_expense_text,
    chat_with_finance_bot,
    generate_budget_plan
)
from app.models import NaturalLanguageInput, ChatInput, BudgetProfile
from app.auth import get_current_user
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI"])


# ✅ ---------------- PARSE NATURAL LANGUAGE ----------------

@router.post("/parse")
async def parse_natural_language(
    input: NaturalLanguageInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Always returns a valid transaction object.
    Works with:
    - AI result
    - Manual fallback
    - Rate-limit safe
    """

    try:
        result = await parse_expense_text(input.text)

        # ✅ HARD SAFETY GUARANTEES (FRONTEND MUST NEVER CRASH)
        return {
            "amount": float(result.get("amount", 0)),
            "category": result.get("category", "Other"),
            "note": result.get("note", "Transaction"),
            "date": result.get("date") or datetime.now().strftime("%Y-%m-%d"),
            "type": result.get("type", "expense"),
            "account": result.get("account", "wallet"),
        }

    except Exception as e:
        logger.error(f"AI Parse Failure: {e}")

        # ✅ LAST-RESORT FALLBACK RESPONSE
        return {
            "amount": 0,
            "category": "Other",
            "note": input.text.title(),
            "date": datetime.now().strftime("%Y-%m-%d"),
            "type": "expense",
            "account": "wallet",
        }


# ✅ ---------------- CHAT WITH FINANCE BOT ----------------

@router.post("/chat")
async def chat(
    input: ChatInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Safe chat endpoint with AI fallback.
    Never crashes frontend.
    """

    try:
        response = await chat_with_finance_bot(
            input.message,
            input.context or ""
        )

        return {
            "response": response or "AI is busy. Try again shortly."
        }

    except Exception as e:
        logger.error(f"Chat Error: {e}")
        return {
            "response": "AI is temporarily unavailable. Please try again later."
        }


# ✅ ---------------- GENERATE BUDGET PLAN ----------------

@router.post("/plan")
async def create_plan(
    profile: BudgetProfile,
    current_user: dict = Depends(get_current_user)
):
    """
    Generates a safe budget plan.
    Even if AI fails, frontend still receives a valid structure.
    """

    try:
        plan = await generate_budget_plan(
            profile.salary or 0,
            profile.fixed_costs or {},
            profile.goals or [],
            profile.spending_summary or "",
            profile.user_context or ""
        )

        if not plan:
            raise Exception("AI returned empty plan")

        # ✅ Safe normalized response
        return {
            "summary": plan.get("summary", "Your financial overview is ready."),
            "breakdown": plan.get("breakdown", []),
            "tips": plan.get("tips", ["Track your expenses regularly."]),
            "alternatives": plan.get("alternatives", [])
        }

    except Exception as e:
        logger.error(f"Budget Plan Error: {e}")

        # ✅ FAIL-SAFE STRUCTURE (FRONTEND WILL NEVER BREAK)
        return {
            "summary": "System is busy. Please try again later.",
            "breakdown": [],
            "tips": [
                "Track expenses manually",
                "Avoid unnecessary spending",
                "Save at least 20% of your income"
            ],
            "alternatives": []
        }
