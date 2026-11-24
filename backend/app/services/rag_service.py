"""
RAG Service – uses updated Gemini service
"""
from app.services.gemini import embed_text_sync, ask_gemini
from app.database import supabase_admin
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    return chunks

async def ingest_document(
    document_text: str,
    source_name: str,
    source_url: str,
    document_type: str = "scheme",
    scheme_id: Optional[str] = None
) -> int:
    chunks = chunk_text(document_text)
    stored = 0
    for i, chunk in enumerate(chunks):
        try:
            embedding = embed_text_sync(chunk)
            supabase_admin.table("rag_chunks").insert({
                "content": chunk,
                "embedding": embedding,
                "source_name": source_name,
                "source_url": source_url,
                "document_type": document_type,
                "scheme_id": scheme_id,
                "chunk_index": i,
            }).execute()
            stored += 1
        except Exception as e:
            logger.error(f"Failed to store chunk {i}: {e}")
    return stored

async def semantic_search(query: str, limit: int = 5, filter_scheme_id: str = None) -> List[dict]:
    try:
        query_embedding = embed_text_sync(query)
        params = {
            "query_embedding": query_embedding,
            "match_count": limit,
        }
        if filter_scheme_id:
            params["filter_scheme_id"] = filter_scheme_id
        result = supabase_admin.rpc("match_rag_chunks", params).execute()
        return result.data or []
    except Exception as e:
        logger.error(f"Semantic search error: {e}")
        return []

async def rag_query(question: str, language: str = "en", scheme_id: str = None) -> dict:
    chunks = await semantic_search(question, limit=5, filter_scheme_id=scheme_id)

    if not chunks:
        result = await ask_gemini(question, context="", language=language)
        result["sources"] = []
        result["rag_used"] = False
        result["trust_label"] = "Unverified – No official documents retrieved"
        return result

    context_parts = []
    sources = []
    for chunk in chunks:
        context_parts.append(chunk.get("content", ""))
        source = {"name": chunk.get("source_name"), "url": chunk.get("source_url")}
        if source not in sources:
            sources.append(source)

    context = "\n\n---\n\n".join(context_parts)
    result = await ask_gemini(question, context=context, language=language)
    result["sources"] = sources
    result["rag_used"] = True
    return result
