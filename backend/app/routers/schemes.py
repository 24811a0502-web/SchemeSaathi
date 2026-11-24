from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.database import supabase_admin
from app.services.eligibility_engine import EligibilityInput, evaluate_all_schemes, SCHEME_RULES
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def get_schemes(
    state: Optional[str] = None,
    tag: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 50
):
    """List all schemes with optional filters."""
    query = supabase_admin.table("schemes").select("*").eq("is_active", True)
    if state:
        query = query.or_(f"applicable_state.eq.All India,applicable_state.ilike.%{state}%")
    if search:
        query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")
    query = query.limit(limit)
    result = query.execute()
    return result.data or []

@router.get("/{scheme_key}")
async def get_scheme(scheme_key: str):
    result = supabase_admin.table("schemes").select("*").eq("scheme_key", scheme_key).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Scheme not found")
    return result.data

@router.post("/match")
async def match_schemes(user: dict = Depends(get_current_user)):
    """
    Reverse Scheme Matchmaker – match schemes against user profile + family.
    Uses the deterministic eligibility engine.
    """
    # Load user profile
    profile_res = supabase_admin.table("profiles").select("*").eq("id", user["id"]).single().execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found. Please complete your profile first.")
    profile_data = profile_res.data

    # Load family members
    family_res = supabase_admin.table("family_members").select("*").eq("user_id", user["id"]).execute()
    family = family_res.data or []

    # Build eligibility input for the user
    user_input = EligibilityInput(
        age=profile_data.get("age"),
        gender=profile_data.get("gender"),
        state=profile_data.get("state"),
        district=profile_data.get("district"),
        annual_income=profile_data.get("annual_income"),
        occupation=profile_data.get("occupation"),
        education=profile_data.get("education"),
        family_size=profile_data.get("family_size"),
        category=profile_data.get("category"),
        is_farmer=profile_data.get("is_farmer", False),
        is_student=profile_data.get("is_student", False),
        has_disability=profile_data.get("has_disability", False),
    )

    # Run rules for user
    user_results = evaluate_all_schemes(user_input)

    # Load scheme metadata
    schemes_res = supabase_admin.table("schemes").select("scheme_key, name, applicable_state, official_url, tags, benefits, verification_status, last_verified").eq("is_active", True).execute()
    scheme_meta = {s["scheme_key"]: s for s in (schemes_res.data or [])}

    def build_match(key, result, member_name="You"):
        meta = scheme_meta.get(key, {})
        return {
            "scheme_key": key,
            "scheme_name": meta.get("name", key),
            "applicable_state": meta.get("applicable_state", ""),
            "official_url": meta.get("official_url", ""),
            "tags": meta.get("tags", []),
            "benefits_summary": meta.get("benefits", ""),
            "verification_status": meta.get("verification_status", "UNVERIFIED"),
            "last_verified": meta.get("last_verified", ""),
            "member": member_name,
            "status": result.status,
            "eligible": result.eligible,
            "reasons": result.reasons,
            "missing_info": result.missing_info,
            "benefit_estimate": result.benefit_estimate,
            "required_documents": result.required_documents,
            "trust_label": result.trust_label,
        }

    user_matches = [build_match(k, r) for k, r in user_results.items()]

    # Run for each family member
    family_matches = []
    for member in family:
        member_input = EligibilityInput(
            age=member.get("age"),
            gender=member.get("gender"),
            state=profile_data.get("state"),
            annual_income=member.get("annual_income"),
            occupation=member.get("occupation"),
            education=member.get("education"),
            category=member.get("category") or profile_data.get("category"),
            is_farmer=member.get("is_farmer", False),
            is_student=member.get("is_student", False),
            has_disability=member.get("has_disability", False),
        )
        member_results = evaluate_all_schemes(member_input)
        for key, result in member_results.items():
            family_matches.append(build_match(key, result, member.get("name", "Family Member")))

    # Combine and de-duplicate
    all_matches = user_matches + family_matches
    eligible = [m for m in all_matches if m["eligible"]]
    additional_info = [m for m in all_matches if m["status"] == "ADDITIONAL_INFO_REQUIRED"]
    not_eligible = [m for m in all_matches if not m["eligible"] and m["status"] != "ADDITIONAL_INFO_REQUIRED"]

    return {
        "user_profile_complete": bool(profile_data.get("age") and profile_data.get("state")),
        "total_schemes_checked": len(SCHEME_RULES),
        "eligible_matches": eligible,
        "needs_more_info": additional_info,
        "not_eligible": not_eligible,
        "family_members_checked": len(family),
        "disclaimer": "Results are based on the deterministic eligibility engine using your provided profile data. Official eligibility is determined by government officials. Verify all information at the official scheme portals before applying.",
    }

@router.post("/family-benefit-finder")
async def family_benefit_finder(user: dict = Depends(get_current_user)):
    """
    Family Benefit Finder – detailed per-member analysis.
    Each member evaluated independently. No automatic eligibility transfer.
    """
    profile_res = supabase_admin.table("profiles").select("*").eq("id", user["id"]).single().execute()
    if not profile_res.data:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile_data = profile_res.data

    family_res = supabase_admin.table("family_members").select("*").eq("user_id", user["id"]).execute()
    family = family_res.data or []

    if not family:
        raise HTTPException(status_code=400, detail="No family members added. Please add family members first.")

    scheme_meta_res = supabase_admin.table("schemes").select("*").eq("is_active", True).execute()
    scheme_meta = {s["scheme_key"]: s for s in (scheme_meta_res.data or [])}

    member_reports = []
    all_eligible_scheme_keys = set()

    for member in family:
        member_input = EligibilityInput(
            age=member.get("age"),
            gender=member.get("gender"),
            state=profile_data.get("state"),
            district=profile_data.get("district"),
            annual_income=member.get("annual_income"),
            occupation=member.get("occupation"),
            education=member.get("education"),
            category=member.get("category") or profile_data.get("category"),
            is_farmer=member.get("is_farmer", False),
            is_student=member.get("is_student", False),
            has_disability=member.get("has_disability", False),
            relation=member.get("relation"),
        )
        results = evaluate_all_schemes(member_input)
        eligible_schemes = []
        for key, result in results.items():
            meta = scheme_meta.get(key, {})
            if result.eligible:
                all_eligible_scheme_keys.add(key)
                eligible_schemes.append({
                    "scheme_key": key,
                    "scheme_name": meta.get("name", key),
                    "benefit_estimate": result.benefit_estimate,
                    "required_documents": result.required_documents,
                    "official_url": meta.get("official_url", ""),
                    "trust_label": result.trust_label,
                    "reasons": result.reasons,
                })

        member_reports.append({
            "member_id": member["id"],
            "name": member["name"],
            "relation": member["relation"],
            "age": member["age"],
            "is_demo": member.get("is_demo", False),
            "eligible_schemes": eligible_schemes,
            "eligible_count": len(eligible_schemes),
            "needs_more_info": [
                {"scheme_key": k, "scheme_name": scheme_meta.get(k, {}).get("name", k), "missing": r.missing_info}
                for k, r in results.items() if r.status == "ADDITIONAL_INFO_REQUIRED"
            ],
        })

    # Shared / overlapping schemes
    if len(family) > 1:
        member_scheme_sets = [
            set(s["scheme_key"] for s in mr["eligible_schemes"]) for mr in member_reports
        ]
        shared = set.intersection(*member_scheme_sets) if member_scheme_sets else set()
    else:
        shared = set()

    return {
        "member_reports": member_reports,
        "shared_schemes": list(shared),
        "total_unique_eligible_schemes": len(all_eligible_scheme_keys),
        "family_size": len(family),
        "disclaimer": "Each family member is evaluated independently. Eligibility is not automatically transferred between members. Official eligibility determined by government officials.",
    }
