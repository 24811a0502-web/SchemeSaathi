from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional
from app.auth import get_current_user
from app.services.gemini import analyze_image_for_scam
from app.database import supabase_admin
import logging
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"}
MAX_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/analyze")
async def analyze_scam(
    file: Optional[UploadFile] = File(None),
    text_content: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    """Analyze a file, text, or URL for scam indicators."""
    if not file and not text_content and not url:
        raise HTTPException(status_code=400, detail="Provide a file, text content, or URL to analyze")

    image_bytes = None
    mime_type = None
    additional_text = text_content or ""

    if url:
        additional_text += f"\nURL to analyze: {url}"

    if file:
        if file.content_type not in ALLOWED_TYPES and not file.filename.lower().endswith(('.jpg', '.jpeg', '.png', '.pdf')):
            raise HTTPException(status_code=400, detail="Unsupported file type")

        content = await file.read()
        if len(content) > MAX_SIZE:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")

        image_bytes = content
        mime_type = file.content_type or "image/jpeg"

    if image_bytes:
        result = await analyze_image_for_scam(image_bytes, mime_type, additional_text)
    else:
        # Text-only analysis
        from app.services.gemini import ask_gemini
        prompt = f"""Analyze this text/URL for government scheme scam indicators:

{additional_text}

Classify as VERIFIED, SUSPICIOUS, or UNVERIFIED and explain your reasoning.
Return JSON: {{"classification": "...", "risk_level": "LOW|MEDIUM|HIGH|CRITICAL", "evidence": [], "safety_recommendations": [], "explanation": "..."}}"""
        import json, re
        gemini_result = await ask_gemini(prompt)
        text = gemini_result.get("answer", "")
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = {"classification": "UNVERIFIED", "risk_level": "MEDIUM", "evidence": [], "explanation": text}

    # Save report
    try:
        report_id = str(uuid.uuid4())
        supabase_admin.table("scam_reports").insert({
            "id": report_id,
            "user_id": user["id"],
            "classification": result.get("classification", "UNVERIFIED"),
            "risk_level": result.get("risk_level", "MEDIUM"),
            "evidence": result.get("evidence", []),
            "safety_recommendations": result.get("safety_recommendations", []),
            "explanation": result.get("explanation", ""),
            "url_analyzed": url,
            "has_file": file is not None,
            "analyzed_at": datetime.utcnow().isoformat(),
        }).execute()
        result["report_id"] = report_id
    except Exception as e:
        logger.warning(f"Could not save scam report: {e}")

    result["analyzed_at"] = datetime.utcnow().isoformat()
    return result

@router.get("/reports")
async def get_scam_reports(user: dict = Depends(get_current_user)):
    result = supabase_admin.table("scam_reports").select("*").eq("user_id", user["id"]).order("analyzed_at", desc=True).execute()
    return result.data or []

