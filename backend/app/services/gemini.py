"""
Gemini AI Service (backend only – keys never exposed to frontend)
Uses google-genai (new SDK) instead of deprecated google-generativeai
"""
import logging
import re
import json
from app.config import settings

logger = logging.getLogger(__name__)

try:
    from google import genai
    from google.genai import types
    USE_NEW_SDK = True
except ImportError:
    try:
        import google.generativeai as genai_legacy
        USE_NEW_SDK = False
        logger.warning("Using deprecated google-generativeai. Please upgrade to google-genai.")
    except ImportError:
        raise ImportError("Neither google-genai nor google-generativeai is installed.")

SYSTEM_PROMPT = """You are SchemeSaathi AI, a helpful government scheme assistant for Indian citizens.

STRICT RULES:
1. You NEVER invent government schemes, eligibility rules, benefits, deadlines, or government rules.
2. You only explain and elaborate on information provided to you from verified sources.
3. If you cannot verify information from provided evidence, say so explicitly.
4. The Python eligibility engine results are AUTHORITATIVE – you explain them, never override them.
5. Always cite official sources when available.
6. Respond in the language requested (English/Telugu/Hindi).
7. Never ask users for Aadhaar numbers, OTPs, passwords, or banking credentials.

Trust Labels:
- OFFICIALLY_SOURCED: Information directly from official government websites
- VERIFIED: Cross-verified against multiple official sources  
- PARTIALLY_VERIFIED: Some information verified, some uncertain
- UNVERIFIED: Cannot verify from available evidence
- CONFLICTING: Multiple official sources disagree
"""

def _get_client():
    if USE_NEW_SDK:
        return genai.Client(api_key=settings.gemini_api_key)
    return None

def _call_gemini(prompt: str, image_bytes: bytes = None, mime_type: str = None) -> str:
    """Unified Gemini call supporting both SDKs."""
    if USE_NEW_SDK:
        client = _get_client()
        contents = []
        if image_bytes and mime_type:
            contents.append(types.Part.from_bytes(data=image_bytes, mime_type=mime_type))
        contents.append(prompt)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,
            )
        )
        return response.text
    else:
        genai_legacy.configure(api_key=settings.gemini_api_key)
        model = genai_legacy.GenerativeModel("gemini-1.5-flash", system_instruction=SYSTEM_PROMPT)
        if image_bytes and mime_type:
            response = model.generate_content([prompt, {"mime_type": mime_type, "data": image_bytes}])
        else:
            response = model.generate_content(prompt)
        return response.text

def _embed_text(text: str) -> list:
    """Generate text embedding."""
    if USE_NEW_SDK:
        client = _get_client()
        result = client.models.embed_content(
            model="text-embedding-004",
            contents=text
        )
        return result.embeddings[0].values
    else:
        genai_legacy.configure(api_key=settings.gemini_api_key)
        result = genai_legacy.embed_content(model="models/text-embedding-004", content=text)
        return result["embedding"]

async def ask_gemini(
    question: str,
    context: str = "",
    language: str = "en",
    eligibility_result: dict = None
) -> dict:
    lang_instruction = {
        "en": "Respond in English.",
        "te": "Respond in Telugu (తెలుగు).",
        "hi": "Respond in Hindi (हिंदी).",
    }.get(language, "Respond in English.")

    parts = [lang_instruction, "\n\n"]
    if eligibility_result:
        parts.append("ELIGIBILITY ENGINE RESULT (authoritative, do not override):\n")
        parts.append(str(eligibility_result))
        parts.append("\n\n")
    if context:
        parts.append("VERIFIED OFFICIAL CONTEXT:\n")
        parts.append(context)
        parts.append("\n\n")
    parts.append(f"USER QUESTION: {question}")
    parts.append("\n\nProvide a helpful, accurate answer. If the official context does not contain enough information to answer fully, say so explicitly rather than speculating.")

    try:
        answer = _call_gemini("".join(parts))
        return {
            "answer": answer,
            "language": language,
            "trust_label": "Verified Against Available Official Evidence" if context else "Unverified – No official context retrieved",
        }
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        raise

async def analyze_image_for_scam(image_bytes: bytes, mime_type: str, additional_text: str = "") -> dict:
    prompt = f"""Analyze this image/document for potential government scheme scams.

Check for:
1. Fake application fees (genuine government schemes do not charge fees)
2. Lookalike/phishing domain names
3. Suspicious urgency or pressure tactics
4. Fraudulent benefit claims
5. Requests for sensitive information (Aadhaar, OTP, passwords, bank details)
6. Suspicious payment requests
7. Poor grammar/spelling in official-looking documents
8. Unofficial contact numbers or unofficial URLs

Classify as: VERIFIED, SUSPICIOUS, or UNVERIFIED

Provide your response in this JSON structure:
{{
  "classification": "VERIFIED|SUSPICIOUS|UNVERIFIED",
  "risk_level": "LOW|MEDIUM|HIGH|CRITICAL",
  "evidence": ["list of specific suspicious elements found"],
  "official_comparison": "What legitimate government schemes look like vs this",
  "safety_recommendations": ["list of recommended actions"],
  "explanation": "Brief explanation of your findings"
}}

IMPORTANT: Never classify something as FAKE solely because it is not in your training data.
If you cannot determine with confidence, classify as UNVERIFIED.
{f'Additional context: {additional_text}' if additional_text else ''}"""

    try:
        text = _call_gemini(prompt, image_bytes, mime_type)
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        if json_match:
            return json.loads(json_match.group())
        return {"classification": "UNVERIFIED", "risk_level": "MEDIUM", "evidence": [], "explanation": text}
    except Exception as e:
        logger.error(f"Scam analysis error: {e}")
        raise

async def simplify_pdf_content(text: str, language: str = "en") -> dict:
    lang_instruction = {
        "en": "Respond in simple English.",
        "te": "Respond in simple Telugu (తెలుగు).",
        "hi": "Respond in simple Hindi (हिंदी).",
    }.get(language, "Respond in simple English.")

    prompt = f"""{lang_instruction}

You are given the text of a government scheme document. Extract and explain clearly:

1. **Scheme Objective** – What is this scheme for?
2. **Who is Eligible** – Age, income, category, state requirements
3. **Benefits** – What financial or other benefits are provided?
4. **Income Limits** – Specific income thresholds
5. **Required Documents** – Complete document list
6. **How to Apply** – Step-by-step application process
7. **Deadlines** – Any application deadlines or validity dates
8. **Renewal** – Whether the scheme needs renewal and how
9. **Restrictions** – Who is NOT eligible
10. **Contact** – Official contact details or helpline

DOCUMENT TEXT:
{text[:8000]}

Provide citations like [Page X] where possible. Use simple language a common citizen can understand."""

    try:
        answer = _call_gemini(prompt)
        return {
            "simplified_content": answer,
            "language": language,
            "original_length": len(text),
            "trust_label": "Partially Verified – Based on uploaded document content",
        }
    except Exception as e:
        logger.error(f"Simplify error: {e}")
        raise

async def translate_text(text: str, target_language: str) -> str:
    if target_language == "en":
        return text
    lang_name = {"te": "Telugu", "hi": "Hindi"}.get(target_language, "English")
    prompt = f"Translate the following to {lang_name}. Keep technical terms and scheme names in their original form:\n\n{text}"
    try:
        return _call_gemini(prompt)
    except Exception as e:
        logger.error(f"Translation error: {e}")
        return text

def embed_text_sync(text: str) -> list:
    """Synchronous embedding call for RAG."""
    return _embed_text(text)
