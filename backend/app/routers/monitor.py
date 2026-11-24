from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.database import supabase_admin
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_changes(scheme_key: Optional[str] = None, limit: int = 20):
    query = supabase_admin.table("scheme_changes").select("*")
    if scheme_key:
        query = query.eq("scheme_key", scheme_key)
    result = query.order("created_at", desc=True).limit(limit).execute()
    return result.data or []
