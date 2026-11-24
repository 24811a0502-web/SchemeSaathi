from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.services.rag_service import rag_query
from app.services.gemini import ask_gemini
from app.services.eligibility_engine import EligibilityInput, evaluate_all_schemes
from app.database import supabase_admin
import logging
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

class AgentMessage(BaseModel):
    message: str
    language: str = "en"
    conversation_id: Optional[str] = None
    scheme_id: Optional[str] = None
    # Optional profile context for personalized answers
    age: Optional[int] = None
    state: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    is_farmer: bool = False
    is_student: bool = False
    category: Optional[str] = None

@router.post("/chat")
async def chat_with_agent(data: AgentMessage, user: dict = Depends(get_current_user)):
    """Main AI Civic Agent endpoint."""
    conversation_id = data.conversation_id or str(uuid.uuid4())

    # Load conversation history
    history = []
    try:
        history_result = supabase_admin.table("agent_conversations").select("*").eq(
            "conversation_id", conversation_id
        ).eq("user_id", user["id"]).order("created_at").limit(10).execute()
        history = history_result.data or []
    except Exception as e:
        logger.warning(f"Could not load history: {e}")

    # Build eligibility context if profile data provided
    eligibility_summary = None
    if data.age or data.state or data.annual_income:
        profile = EligibilityInput(
            age=data.age,
            state=data.state,
            annual_income=data.annual_income,
            occupation=data.occupation,
            is_farmer=data.is_farmer,
            is_student=data.is_student,
            category=data.category,
        )
        results = evaluate_all_schemes(profile)
        eligible = [k for k, r in results.items() if r.eligible]
        eligibility_summary = f"Potentially eligible schemes based on provided profile: {', '.join(eligible) if eligible else 'None with given data'}"

    # RAG-grounded answer
    rag_result = await rag_query(data.message, language=data.language, scheme_id=data.scheme_id)

    # Save conversation turn
    try:
        supabase_admin.table("agent_conversations").insert({
            "user_id": user["id"],
            "conversation_id": conversation_id,
            "role": "user",
            "content": data.message,
            "language": data.language,
        }).execute()
        supabase_admin.table("agent_conversations").insert({
            "user_id": user["id"],
            "conversation_id": conversation_id,
            "role": "assistant",
            "content": rag_result.get("answer", ""),
            "language": data.language,
        }).execute()
    except Exception as e:
        logger.warning(f"Could not save conversation: {e}")

    return {
        "conversation_id": conversation_id,
        "answer": rag_result.get("answer", ""),
        "sources": rag_result.get("sources", []),
        "trust_label": rag_result.get("trust_label", "Unverified"),
        "rag_used": rag_result.get("rag_used", False),
        "language": data.language,
        "eligibility_context": eligibility_summary,
    }

@router.get("/history/{conversation_id}")
async def get_conversation_history(conversation_id: str, user: dict = Depends(get_current_user)):
    result = supabase_admin.table("agent_conversations").select("*").eq(
        "conversation_id", conversation_id
    ).eq("user_id", user["id"]).order("created_at").execute()
    return result.data or []

@router.get("/conversations")
async def list_conversations(user: dict = Depends(get_current_user)):
    result = supabase_admin.table("agent_conversations").select(
        "conversation_id, content, created_at"
    ).eq("user_id", user["id"]).eq("role", "user").order("created_at", desc=True).limit(20).execute()
    return result.data or []

