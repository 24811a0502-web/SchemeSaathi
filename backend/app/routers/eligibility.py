from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.services.eligibility_engine import (
    EligibilityInput, evaluate_eligibility, evaluate_all_schemes,
    SCHEME_RULES
)
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class EligibilityRequest(BaseModel):
    scheme_key: Optional[str] = None  # None = evaluate all
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    annual_income: Optional[float] = None
    occupation: Optional[str] = None
    education: Optional[str] = None
    family_size: Optional[int] = None
    category: Optional[str] = None
    is_farmer: bool = False
    is_student: bool = False
    has_disability: bool = False

@router.post("/check")
async def check_eligibility(data: EligibilityRequest, user: dict = Depends(get_current_user)):
    profile = EligibilityInput(
        age=data.age,
        gender=data.gender,
        state=data.state,
        district=data.district,
        annual_income=data.annual_income,
        occupation=data.occupation,
        education=data.education,
        family_size=data.family_size,
        category=data.category,
        is_farmer=data.is_farmer,
        is_student=data.is_student,
        has_disability=data.has_disability,
    )

    if data.scheme_key:
        result = evaluate_eligibility(data.scheme_key, profile)
        return {
            "scheme_key": data.scheme_key,
            "status": result.status,
            "eligible": result.eligible,
            "reasons": result.reasons,
            "missing_info": result.missing_info,
            "benefit_estimate": result.benefit_estimate,
            "required_documents": result.required_documents,
            "restrictions": result.restrictions,
            "official_source": result.official_source,
            "source_url": result.source_url,
            "last_verified": result.last_verified,
            "trust_label": result.trust_label,
        }

    # Evaluate all schemes
    all_results = evaluate_all_schemes(profile)
    return {
        "results": [
            {
                "scheme_key": key,
                "status": res.status,
                "eligible": res.eligible,
                "reasons": res.reasons,
                "missing_info": res.missing_info,
                "benefit_estimate": res.benefit_estimate,
                "required_documents": res.required_documents,
                "official_source": res.official_source,
                "source_url": res.source_url,
                "last_verified": res.last_verified,
                "trust_label": res.trust_label,
            }
            for key, res in all_results.items()
        ]
    }

@router.get("/schemes/supported")
async def list_supported_schemes():
    return {"schemes": list(SCHEME_RULES.keys())}

