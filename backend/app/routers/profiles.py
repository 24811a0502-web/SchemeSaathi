from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.auth import get_current_user
from app.database import supabase_admin
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    state: Optional[str] = None
    district: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    family_size: Optional[int] = None
    category: Optional[str] = None  # SC/ST/OBC/General
    is_farmer: Optional[bool] = None
    is_student: Optional[bool] = None
    has_disability: Optional[bool] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = "en"

@router.get("/me")
async def get_profile(user: dict = Depends(get_current_user)):
    try:
        result = supabase_admin.table("profiles").select("*").eq("id", user["id"]).single().execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Profile not found")
        return result.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/me")
async def update_profile(data: ProfileUpdate, user: dict = Depends(get_current_user)):
    try:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        result = supabase_admin.table("profiles").update(update_data).eq("id", user["id"]).execute()
        return result.data[0] if result.data else {}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

