import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import Document, DocumentChunk, DocumentField
from app.schemas import SearchResponse, SearchResultItem, DocumentSummary
from app.api.deps import get_current_user, AuthenticatedUser
from app.services.embeddings import embedding_service

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("", response_model=SearchResponse)
async def search_documents(
    q: str = Query(..., min_length=1),
    semantic: bool = Query(True),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Performs hybrid search: combining keyword matching and vector semantic search.
    """
    query_str = q.strip().lower()
    results: List[SearchResultItem] = []
    seen_doc_ids = set()

    # 1. Normal Keyword Match on Documents & Fields
    doc_stmt = select(Document).where(Document.user_id == current_user.id)
    doc_res = await db.execute(doc_stmt)
    all_user_docs = doc_res.scalars().all()
    doc_map = {d.id: d for d in all_user_docs}

    for doc in all_user_docs:
        # Check exact title or category
        if query_str in doc.title.lower():
            seen_doc_ids.add(doc.id)
            results.append(SearchResultItem(
                document=DocumentSummary.from_orm(doc),
                score=1.0,
                match_type="keyword",
                matched_snippet=f"Title matched: '{doc.title}'"
            ))
        elif query_str in doc.category.lower() or query_str in doc.document_type.lower():
            seen_doc_ids.add(doc.id)
            results.append(SearchResultItem(
                document=DocumentSummary.from_orm(doc),
                score=0.9,
                match_type="keyword",
                matched_snippet=f"Category/Type matched: '{doc.category}'"
            ))

    # Check fields
    field_stmt = select(DocumentField).join(Document, DocumentField.document_id == Document.id).where(
        Document.user_id == current_user.id
    )
    field_res = await db.execute(field_stmt)
    for f in field_res.scalars().all():
        if f.document_id in seen_doc_ids:
            continue
        if query_str in f.field_name.lower() or query_str in f.field_value.lower():
            doc = doc_map.get(f.document_id)
            if doc:
                seen_doc_ids.add(doc.id)
                results.append(SearchResultItem(
                    document=DocumentSummary.from_orm(doc),
                    score=0.85,
                    match_type="keyword",
                    matched_snippet=f"{f.field_name}: {f.field_value}"
                ))

    # 2. Semantic Search using Vector Embeddings
    if semantic:
        query_vec = embedding_service.generate_embedding(query_str)
        chunk_stmt = select(DocumentChunk).where(DocumentChunk.user_id == current_user.id)
        chunk_res = await db.execute(chunk_stmt)
        chunks = chunk_res.scalars().all()

        semantic_candidates = []
        for c in chunks:
            if c.document_id in seen_doc_ids:
                continue
            c_vec = json.loads(c.embedding_json) if c.embedding_json else []
            sim = embedding_service.cosine_similarity(query_vec, c_vec)
            if sim > 0.20:
                semantic_candidates.append((c.document_id, sim, c.content))

        # Sort semantic candidates by similarity
        semantic_candidates.sort(key=lambda x: x[1], reverse=True)
        for doc_id, sim, snippet in semantic_candidates:
            if doc_id in seen_doc_ids:
                continue
            doc = doc_map.get(doc_id)
            if doc:
                seen_doc_ids.add(doc_id)
                snippet_preview = snippet.replace("\n", " ")[:120] + "..."
                results.append(SearchResultItem(
                    document=DocumentSummary.from_orm(doc),
                    score=round(sim, 3),
                    match_type="semantic",
                    matched_snippet=f"Conceptual match: {snippet_preview}"
                ))

    # Final sort by score
    results.sort(key=lambda x: x.score, reverse=True)

    return SearchResponse(
        query=q,
        total_results=len(results),
        results=results
    )
