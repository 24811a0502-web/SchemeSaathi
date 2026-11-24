from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.database import supabase_admin
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ConflictCreate(BaseModel):
    scheme_key: str
    source_a_name: str
    source_a_url: str
    source_a_content: str
    source_a_date: Optional[str] = None
    source_b_name: str
    source_b_url: str
    source_b_content: str
    source_b_date: Optional[str] = None
    conflict_description: str
    conflict_field: str  # e.g., "income_limit", "eligibility_age", "benefit_amount"

@router.get("/")
async def list_conflicts(scheme_key: Optional[str] = None):
    query = supabase_admin.table("information_conflicts").select("*").eq("verified", False)
    if scheme_key:
        query = query.eq("scheme_key", scheme_key)
    result = query.order("created_at", desc=True).execute()
    return result.data or []

@router.get("/all")
async def list_all_conflicts():
    result = supabase_admin.table("information_conflicts").select("*").order("created_at", desc=True).execute()
    return result.data or []

@router.post("/report")
async def report_conflict(data: ConflictCreate, user: dict = Depends(get_current_user)):
    from datetime import datetime
    import uuid
    result = supabase_admin.table("information_conflicts").insert({
        "id": str(uuid.uuid4()),
        "scheme_key": data.scheme_key,
        "source_a_name": data.source_a_name,
        "source_a_url": data.source_a_url,
        "source_a_content": data.source_a_content,
        "source_a_date": data.source_a_date,
        "source_b_name": data.source_b_name,
        "source_b_url": data.source_b_url,
        "source_b_content": data.source_b_content,
        "source_b_date": data.source_b_date,
        "conflict_description": data.conflict_description,
        "conflict_field": data.conflict_field,
        "reported_by": user["id"],
        "verified": False,
        "created_at": datetime.utcnow().isoformat(),
    }).execute()
    return result.data[0]

