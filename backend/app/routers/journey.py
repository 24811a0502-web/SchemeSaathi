from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.database import supabase_admin
import logging
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

STAGES = [
    "SCHEME_DISCOVERED",
    "ELIGIBILITY_CHECKED",
    "DOCUMENTS_IDENTIFIED",
    "DOCUMENTS_PREPARED",
    "APPLICATION_READY",
    "APPLICATION_SUBMITTED",
    "AWAITING_RESPONSE",
    "APPROVED_REJECTED",
    "RENEWAL_REQUIRED"
]

class JourneyCreate(BaseModel):
    scheme_key: str
    scheme_name: str
    notes: Optional[str] = None

class JourneyStageUpdate(BaseModel):
    stage: str
    notes: Optional[str] = None
    # APPLICATION_SUBMITTED and APPROVED_REJECTED require user confirmation
    user_confirmed: bool = False

@router.get("/")
async def get_journeys(user: dict = Depends(get_current_user)):
    result = supabase_admin.table("user_scheme_journeys").select("*").eq("user_id", user["id"]).order("updated_at", desc=True).execute()
    return result.data or []

@router.post("/")
async def create_journey(data: JourneyCreate, user: dict = Depends(get_current_user)):
    journey_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    result = supabase_admin.table("user_scheme_journeys").insert({
        "id": journey_id,
        "user_id": user["id"],
        "scheme_key": data.scheme_key,
        "scheme_name": data.scheme_name,
        "current_stage": "SCHEME_DISCOVERED",
        "notes": data.notes,
        "created_at": now,
        "updated_at": now,
    }).execute()
    return result.data[0]

@router.put("/{journey_id}/stage")
async def update_stage(journey_id: str, data: JourneyStageUpdate, user: dict = Depends(get_current_user)):
    # Verify ownership
    existing = supabase_admin.table("user_scheme_journeys").select("*").eq("id", journey_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Journey not found")

    # Critical stages require user confirmation
    critical_stages = ["APPLICATION_SUBMITTED", "APPROVED_REJECTED"]
    if data.stage in critical_stages and not data.user_confirmed:
        raise HTTPException(
            status_code=400,
            detail=f"Stage '{data.stage}' requires explicit user confirmation (set user_confirmed=true). Note: We cannot verify external government portal status."
        )

    if data.stage not in STAGES:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {STAGES}")

    now = datetime.utcnow().isoformat()

    # Log stage history
    supabase_admin.table("journey_stages").insert({
        "journey_id": journey_id,
        "stage": data.stage,
        "notes": data.notes,
        "user_confirmed": data.user_confirmed,
        "created_at": now,
    }).execute()

    # Update journey
    result = supabase_admin.table("user_scheme_journeys").update({
        "current_stage": data.stage,
        "notes": data.notes,
        "updated_at": now,
    }).eq("id", journey_id).execute()
    return result.data[0]

@router.get("/{journey_id}/history")
async def get_stage_history(journey_id: str, user: dict = Depends(get_current_user)):
    # Verify ownership
    existing = supabase_admin.table("user_scheme_journeys").select("id").eq("id", journey_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Journey not found")
    result = supabase_admin.table("journey_stages").select("*").eq("journey_id", journey_id).order("created_at").execute()
    return result.data or []

@router.delete("/{journey_id}")
async def delete_journey(journey_id: str, user: dict = Depends(get_current_user)):
    existing = supabase_admin.table("user_scheme_journeys").select("id").eq("id", journey_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Journey not found")
    supabase_admin.table("journey_stages").delete().eq("journey_id", journey_id).execute()
    supabase_admin.table("user_scheme_journeys").delete().eq("id", journey_id).execute()
    return {"message": "Journey deleted"}

@router.get("/stages/list")
async def list_stages():
    return {"stages": STAGES}

