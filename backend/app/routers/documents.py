from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Optional, List
from app.auth import get_current_user
from app.database import supabase_admin
from app.services.gemini import ask_gemini
import logging
import fitz
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze")
async def analyze_documents(
    files: List[UploadFile] = File(...),
    scheme_key: Optional[str] = Form(None),
    user: dict = Depends(get_current_user)
):
    """Analyze uploaded documents for scheme application readiness."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")

    extracted_docs = []
    for file in files:
        content = await file.read()
        if len(content) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail=f"File {file.filename} too large")

        text = ""
        if file.filename.lower().endswith('.pdf'):
            try:
                with fitz.open(stream=content, filetype="pdf") as doc:
                    text = " ".join(page.get_text() for page in doc)
            except Exception as e:
                text = f"[PDF extraction failed: {e}]"
        elif file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            try:
                import pytesseract
                from PIL import Image
                import io
                img = Image.open(io.BytesIO(content))
                text = pytesseract.image_to_string(img, lang='eng')
            except Exception as e:
                text = f"[OCR failed: {e}]"

        extracted_docs.append({
            "filename": file.filename,
            "text": text[:3000],
            "size_bytes": len(content)
        })

    # Analyze with Gemini
    prompt = f"""You are a document readiness analyst for government scheme applications.

Analyze these uploaded documents and provide a readiness report:

Documents uploaded:
{chr(10).join(f"- {d['filename']}: {d['text'][:500]}..." for d in extracted_docs)}

{"Target scheme: " + scheme_key if scheme_key else "General document check"}

Check for:
1. Name consistency across documents
2. Date validity and discrepancies  
3. Missing common required documents
4. Any obvious issues

Respond with this JSON:
{{
  "overall_status": "READY_FOR_APPLICATION|MISSING_DOCUMENTS|DOCUMENTS_REQUIRING_ATTENTION|POTENTIAL_ELIGIBILITY_ISSUES",
  "documents_found": ["list of document types identified"],
  "issues": [{{"type": "MISSING|MISMATCH|EXPIRED|UNCLEAR", "description": "...", "recommendation": "..."}}],
  "ready_documents": ["list of documents that look okay"],
  "missing_documents": ["list of likely missing documents"],
  "recommended_corrections": ["list of corrections needed"],
  "disclaimer": "This analysis is based on OCR text extraction and is NOT an official verification. Actual eligibility is determined by government officials."
}}"""

    try:
        result_text = await ask_gemini(prompt)
        import json, re
        json_match = re.search(r'\{.*\}', result_text.get("answer", ""), re.DOTALL)
        if json_match:
            result = json.loads(json_match.group())
        else:
            result = {
                "overall_status": "DOCUMENTS_REQUIRING_ATTENTION",
                "issues": [],
                "explanation": result_text.get("answer", ""),
                "disclaimer": "This analysis is NOT an official verification."
            }
    except Exception as e:
        result = {
            "overall_status": "DOCUMENTS_REQUIRING_ATTENTION",
            "issues": [{"type": "ERROR", "description": str(e)}],
            "disclaimer": "Analysis failed. Please try again."
        }

    # Save record
    try:
        supabase_admin.table("document_uploads").insert({
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "filename": ", ".join(d["filename"] for d in extracted_docs),
            "document_type": "intelligence",
            "scheme_key": scheme_key,
            "analysis_result": str(result)[:5000],
            "uploaded_at": datetime.utcnow().isoformat(),
        }).execute()
    except Exception as e:
        logger.warning(f"Could not save doc analysis: {e}")

    return result

@router.delete("/{document_id}")
async def delete_document(document_id: str, user: dict = Depends(get_current_user)):
    """User-controlled document deletion."""
    existing = supabase_admin.table("document_uploads").select("id").eq("id", document_id).eq("user_id", user["id"]).execute()
    if not existing.data:
        raise HTTPException(status_code=404, detail="Document not found")
    supabase_admin.table("document_uploads").delete().eq("id", document_id).execute()
    return {"message": "Document deleted successfully"}

@router.get("/my-documents")
async def get_my_documents(user: dict = Depends(get_current_user)):
    result = supabase_admin.table("document_uploads").select("id, filename, document_type, uploaded_at, scheme_key").eq("user_id", user["id"]).order("uploaded_at", desc=True).execute()
    return result.data or []

