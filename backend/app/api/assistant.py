import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Document, DocumentChunk, DocumentField
from app.schemas import AssistantChatRequest, AssistantChatResponse, AssistantSource
from app.api.deps import get_current_user, AuthenticatedUser
from app.services.embeddings import embedding_service
from app.services.llm import llm_service

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])
logger = logging.getLogger("life_admin.assistant")

@router.post("/chat", response_model=AssistantChatResponse)
async def chat_with_documents(
    req: AssistantChatRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Grounded Document Q&A using Vector Similarity Retrieval and Pluggable LLM.
    Strictly isolated to authenticated user's documents.
    """
    query = req.message.strip()
    if not query:
        return AssistantChatResponse(
            answer="Please enter a question about your documents.",
            sources=[],
            grounded=False
        )

    # Generate query embedding
    query_vector = embedding_service.generate_embedding(query)

    # Retrieve all chunks belonging to this user
    chunk_query = select(DocumentChunk, Document.title, Document.document_type).join(
        Document, DocumentChunk.document_id == Document.id
    ).where(DocumentChunk.user_id == current_user.id)

    if req.document_id:
        chunk_query = chunk_query.where(DocumentChunk.document_id == req.document_id)

    res = await db.execute(chunk_query)
    rows = res.all()

    # Calculate similarity scores
    scored_chunks = []
    for chunk, doc_title, doc_type in rows:
        chunk_vec = json.loads(chunk.embedding_json) if chunk.embedding_json else []
        sim = embedding_service.cosine_similarity(query_vector, chunk_vec)
        # Also keyword boost if direct word matches exist
        q_words = set(query.lower().split())
        c_words = set(chunk.content.lower().split())
        overlap = len(q_words.intersection(c_words))
        boosted_sim = sim + (overlap * 0.05)

        scored_chunks.append({
            "document_id": chunk.document_id,
            "document_title": doc_title,
            "document_type": doc_type,
            "page_number": chunk.page_number,
            "content": chunk.content,
            "score": boosted_sim
        })

    # Sort descending by score
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    top_chunks = scored_chunks[:4]

    # If no chunks or score very low, check structured document fields as fallback
    if not top_chunks or top_chunks[0]["score"] < 0.15:
        # Check if query matches any field value or title
        field_query = select(DocumentField, Document.title, Document.document_type).join(
            Document, DocumentField.document_id == Document.id
        ).where(Document.user_id == current_user.id)
        if req.document_id:
            field_query = field_query.where(DocumentField.document_id == req.document_id)
        
        field_res = await db.execute(field_query)
        field_rows = field_res.all()
        for f, d_title, d_type in field_rows:
            if any(term in f.field_name.lower() or term in f.field_value.lower() or term in d_title.lower() for term in query.lower().split()):
                top_chunks.append({
                    "document_id": f.document_id,
                    "document_title": d_title,
                    "document_type": d_type,
                    "page_number": 1,
                    "content": f"{f.field_name}: {f.field_value}",
                    "score": 0.85
                })

    if not top_chunks:
        return AssistantChatResponse(
            answer="I couldn't find that information in your documents.",
            sources=[],
            grounded=False
        )

    # Pass context to pluggable LLM
    llm_res = await llm_service.generate_grounded_answer(
        query=query,
        context_chunks=top_chunks,
        chat_history=[{"role": h.role, "content": h.content} for h in (req.history or [])]
    )

    # Build sources
    sources = []
    seen_doc_pages = set()
    for c in top_chunks:
        key = (c["document_id"], c["page_number"])
        if key not in seen_doc_pages:
            seen_doc_pages.add(key)
            # Create a clean excerpt
            excerpt = c["content"].split("\n")[0][:100]
            sources.append(AssistantSource(
                document_id=c["document_id"],
                document_title=c["document_title"],
                document_type=c["document_type"],
                page_number=c["page_number"],
                excerpt=excerpt,
                confidence=round(min(0.99, max(0.70, c["score"])), 2)
            ))

    suggested_actions = []
    if "vehicle" in query.lower() or "car" in query.lower():
        suggested_actions.append("View Vehicle Documents")
    if "expire" in query.lower() or "due" in query.lower():
        suggested_actions.append("Check Reminders")

    return AssistantChatResponse(
        answer=llm_res["answer"],
        sources=sources if llm_res["grounded"] else [],
        grounded=llm_res["grounded"],
        suggested_actions=suggested_actions
    )
