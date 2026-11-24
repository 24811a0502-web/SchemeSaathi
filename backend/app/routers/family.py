from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.database import supabase_admin
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class FamilyMemberCreate(BaseModel):
    name: str
    relation: str  # father, mother, son, daughter, spouse, grandfather, grandmother, other
    age: int
    gender: str
    occupation: Optional[str] = None
    education: Optional[str] = None
    annual_income: Optional[float] = None
    is_farmer: Optional[bool] = False
    is_student: Optional[bool] = False
    has_disability: Optional[bool] = False
    category: Optional[str] = None
    is_demo: Optional[bool] = False

class FamilyMemberUpdate(FamilyMemberCreate):
    pass

@router.get("/")
async def get_family(user: dict = Depends(get_current_user)):
    result = supabase_admin.table("family_members").select("*").eq("user_id", user["id"]).execute()
    return result.data or []

@router.post("/")
async def add_family_member(data: FamilyMemberCreate, user: dict = Depends(get_current_user)):
    try:
        payload = data.model_dump()
        payload["user_id"] = user["id"]
        result = supabase_admin.table("family_members").insert(payload).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{member_id}")
async def update_family_member(member_id: str, data: FamilyMemberUpdate, user: dict = Depends(get_current_user)):
    # Verify ownership
    existing = supabase_admin.table("family_members").select("id").eq("id", member_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Family member not found")
    result = supabase_admin.table("family_members").update(data.model_dump()).eq("id", member_id).execute()
    return result.data[0]

@router.delete("/{member_id}")
async def delete_family_member(member_id: str, user: dict = Depends(get_current_user)):
    existing = supabase_admin.table("family_members").select("id").eq("id", member_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Family member not found")
    supabase_admin.table("family_members").delete().eq("id", member_id).execute()
    return {"message": "Deleted"}

@router.post("/seed-demo")
async def seed_demo_family(user: dict = Depends(get_current_user)):
    """Seed the 4-member demonstration family for the current user."""
    # Remove existing demo members
    supabase_admin.table("family_members").delete().eq("user_id", user["id"]).eq("is_demo", True).execute()
    demo_members = [
        {"name": "Demo Father", "relation": "father", "age": 45, "gender": "male",
         "occupation": "farmer", "education": "secondary", "annual_income": 72000,
         "is_farmer": True, "is_student": False, "has_disability": False,
         "category": "OBC", "is_demo": True, "user_id": user["id"]},
        {"name": "Demo Mother", "relation": "mother", "age": 40, "gender": "female",
         "occupation": "homemaker", "education": "secondary", "annual_income": 0,
         "is_farmer": False, "is_student": False, "has_disability": False,
         "category": "OBC", "is_demo": True, "user_id": user["id"]},
        {"name": "Demo Daughter", "relation": "daughter", "age": 19, "gender": "female",
         "occupation": "student", "education": "higher_secondary", "annual_income": 0,
         "is_farmer": False, "is_student": True, "has_disability": False,
         "category": "OBC", "is_demo": True, "user_id": user["id"]},
        {"name": "Demo Grandfather", "relation": "grandfather", "age": 70, "gender": "male",
         "occupation": "retired", "education": "primary", "annual_income": 0,
         "is_farmer": False, "is_student": False, "has_disability": False,
         "category": "OBC", "is_demo": True, "user_id": user["id"]},
    ]
    result = supabase_admin.table("family_members").insert(demo_members).execute()
    return {"message": "Demo family seeded", "members": result.data}

