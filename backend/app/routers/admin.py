from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.auth import get_admin_user
from app.database import supabase_admin
import logging
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

class SchemeCreate(BaseModel):
    scheme_key: str
    name: str
    description: str
    eligibility_summary: Optional[str] = None
    benefits: Optional[str] = None
    income_limit: Optional[float] = None
    required_documents: Optional[List[str]] = None
    application_procedure: Optional[str] = None
    applicable_state: str = "All India"
    official_url: Optional[str] = None
    helpline: Optional[str] = None
    last_verified: Optional[str] = None
    verification_status: str = "UNVERIFIED"
    tags: Optional[List[str]] = None

class SchemeUpdate(SchemeCreate):
    pass

class ConflictResolve(BaseModel):
    conflict_id: str
    resolution: str

@router.get("/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    schemes_count = supabase_admin.table("schemes").select("id", count="exact").execute()
    users_count = supabase_admin.table("profiles").select("id", count="exact").execute()
    conflicts_count = supabase_admin.table("information_conflicts").select("id", count="exact").eq("verified", False).execute()
    scam_reports_count = supabase_admin.table("scam_reports").select("id", count="exact").execute()
    journeys_count = supabase_admin.table("user_scheme_journeys").select("id", count="exact").execute()
    return {
        "schemes": schemes_count.count or 0,
        "users": users_count.count or 0,
        "unresolved_conflicts": conflicts_count.count or 0,
        "scam_reports": scam_reports_count.count or 0,
        "active_journeys": journeys_count.count or 0,
    }

@router.post("/schemes")
async def create_scheme(data: SchemeCreate, admin: dict = Depends(get_admin_user)):
    now = datetime.utcnow().isoformat()
    result = supabase_admin.table("schemes").insert({
        "id": str(uuid.uuid4()),
        **data.model_dump(),
        "is_active": True,
        "created_at": now,
        "updated_at": now,
    }).execute()
    # Log admin action
    supabase_admin.table("admin_logs").insert({
        "admin_id": admin["id"],
        "action": "CREATE_SCHEME",
        "resource_type": "scheme",
        "resource_id": data.scheme_key,
        "details": {"name": data.name},
    }).execute()
    return result.data[0]

@router.put("/schemes/{scheme_key}")
async def update_scheme(scheme_key: str, data: SchemeUpdate, admin: dict = Depends(get_admin_user)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.utcnow().isoformat()
    result = supabase_admin.table("schemes").update(update).eq("scheme_key", scheme_key).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Scheme not found")
    supabase_admin.table("admin_logs").insert({
        "admin_id": admin["id"],
        "action": "UPDATE_SCHEME",
        "resource_type": "scheme",
        "resource_id": scheme_key,
    }).execute()
    return result.data[0]

@router.delete("/schemes/{scheme_key}")
async def delete_scheme(scheme_key: str, admin: dict = Depends(get_admin_user)):
    result = supabase_admin.table("schemes").update({"is_active": False}).eq("scheme_key", scheme_key).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Scheme not found")
    supabase_admin.table("admin_logs").insert({
        "admin_id": admin["id"],
        "action": "DEACTIVATE_SCHEME",
        "resource_type": "scheme",
        "resource_id": scheme_key,
    }).execute()
    return {"message": "Scheme deactivated"}

@router.post("/conflicts/{conflict_id}/resolve")
async def resolve_conflict(conflict_id: str, data: ConflictResolve, admin: dict = Depends(get_admin_user)):
    now = datetime.utcnow().isoformat()
    result = supabase_admin.table("information_conflicts").update({
        "verified": True,
        "admin_resolution": data.resolution,
        "resolved_by": admin["id"],
        "resolved_at": now,
    }).eq("id", conflict_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Conflict not found")
    return result.data[0]

@router.get("/logs")
async def get_admin_logs(admin: dict = Depends(get_admin_user), limit: int = 50):
    result = supabase_admin.table("admin_logs").select("*").order("created_at", desc=True).limit(limit).execute()
    return result.data or []

@router.get("/users")
async def get_all_users(admin: dict = Depends(get_admin_user)):
    result = supabase_admin.table("profiles").select("id, email, full_name, role, state, created_at").order("created_at", desc=True).execute()
    return result.data or []

@router.put("/users/{user_id}/role")
async def update_user_role(user_id: str, role: str, admin: dict = Depends(get_admin_user)):
    if role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    supabase_admin.table("profiles").update({"role": role}).eq("id", user_id).execute()
    return {"message": f"User role updated to {role}"}
