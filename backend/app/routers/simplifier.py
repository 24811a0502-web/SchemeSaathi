from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import Optional
from app.auth import get_current_user
from app.services.gemini import simplify_pdf_content
from app.services.rag_service import ingest_document, rag_query
from app.database import supabase_admin
import logging
import fitz  # PyMuPDF
import uuid
from datetime import datetime

router = APIRouter()
logger = logging.getLogger(__name__)

MAX_SIZE = 10 * 1024 * 1024

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF."""
    text_parts = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page_num, page in enumerate(doc, start=1):
            text = page.get_text()
            if text.strip():
                text_parts.append(f"[Page {page_num}]\n{text}")
    return "\n\n".join(text_parts)

def extract_text_from_image(image_bytes: bytes) -> str:
    """Extract text from image using pytesseract."""
    try:
        import pytesseract
        from PIL import Image
        import io
        img = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(img, lang='eng+tel+hin')
    except Exception as e:
        logger.warning(f"OCR failed: {e}")
        return ""

@router.post("/simplify")
async def simplify_pdf(
    file: UploadFile = File(...),
    language: str = Form("en"),
    user: dict = Depends(get_current_user)
):
    """Upload a government PDF and get a simplified explanation."""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Extract text
    try:
        raw_text = extract_text_from_pdf(content)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not extract text from PDF: {e}")

    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="No text could be extracted from this PDF. It may be scanned.")

    # Simplify with Gemini
    result = await simplify_pdf_content(raw_text, language=language)

    # Ingest into RAG for follow-up Q&A
    doc_id = str(uuid.uuid4())
    try:
        chunks_stored = await ingest_document(
            document_text=raw_text,
            source_name=file.filename,
            source_url="user-uploaded",
            document_type="user_uploaded_pdf",
            scheme_id=doc_id,
        )
        result["rag_chunks_stored"] = chunks_stored
    except Exception as e:
        logger.warning(f"RAG ingestion failed: {e}")
        result["rag_chunks_stored"] = 0

    # Save upload record
    try:
        supabase_admin.table("document_uploads").insert({
            "id": doc_id,
            "user_id": user["id"],
            "filename": file.filename,
            "document_type": "simplifier",
            "text_extracted": raw_text[:5000],
            "simplified_content": result.get("simplified_content", "")[:5000],
            "language": language,
            "uploaded_at": datetime.utcnow().isoformat(),
        }).execute()
        result["document_id"] = doc_id
    except Exception as e:
        logger.warning(f"Could not save upload record: {e}")

    return result

@router.post("/qa")
async def ask_about_document(
    document_id: str,
    question: str,
    language: str = "en",
    user: dict = Depends(get_current_user)
):
    """Ask a question about a previously uploaded simplified PDF."""
    # Verify document belongs to user
    doc = supabase_admin.table("document_uploads").select("*").eq("id", document_id).eq("user_id", user["id"]).execute()
    if not doc.data:
        raise HTTPException(status_code=404, detail="Document not found")

    result = await rag_query(question, language=language, scheme_id=document_id)
    return result

