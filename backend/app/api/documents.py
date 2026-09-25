import uuid
import datetime
import io
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, desc, asc

from app.database import get_db
from app.models import Document, DocumentField, DocumentChunk, Reminder, ProcessingJob
from app.schemas import (
    DocumentSummary, DocumentDetailResponse, DocumentFieldSchema,
    DocumentConfirmRequest, DocumentUpdateRequest, ProcessingStatusResponse
)
from app.api.deps import get_current_user, AuthenticatedUser
from app.services.storage import storage_service
from app.services.pipeline import processing_pipeline
from app.services.reminders import compute_document_status

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png"
}

@router.post("/upload", response_model=DocumentSummary)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    document_type: Optional[str] = Form("other"),
    category: Optional[str] = Form("other"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads a document, saves it to secure storage, and triggers AI processing.
    """
    mime_type = file.content_type or "application/octet-stream"
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{mime_type}'. Supported: PDF, JPG, PNG."
        )

    doc_id = str(uuid.uuid4())
    doc_title = title or file.filename or f"Document {datetime.date.today()}"

    # Save file to storage
    file_path, file_size = await storage_service.save_file(file, current_user.id, doc_id)

    # Create document record
    doc = Document(
        id=doc_id,
        user_id=current_user.id,
        title=doc_title,
        document_type=document_type or "other",
        category=category or "other",
        file_path=file_path,
        mime_type=mime_type,
        file_size_bytes=file_size,
        status="processing",
        user_confirmed=False
    )
    db.add(doc)

    # Create processing job
    job = ProcessingJob(
        document_id=doc_id,
        status="processing",
        step="reading",
        progress_percentage=10
    )
    db.add(job)
    await db.commit()
    await db.refresh(doc)

    # Run processing pipeline immediately for instant feedback or background
    await processing_pipeline.process_document(db, doc_id, current_user.id)
    await db.refresh(doc)

    return doc

@router.get("", response_model=List[DocumentSummary])
async def list_documents(
    category: Optional[str] = None,
    document_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists documents belonging exclusively to current user with filtering & sorting.
    """
    query = select(Document).where(Document.user_id == current_user.id)

    if category and category != "all":
        query = query.where(Document.category == category)
    if document_type and document_type != "all":
        query = query.where(Document.document_type == document_type)
    if status_filter and status_filter != "all":
        query = query.where(Document.status == status_filter)
    if search:
        search_term = f"%{search.strip().lower()}%"
        query = query.where(
            (Document.title.ilike(search_term)) |
            (Document.raw_ocr_text.ilike(search_term)) |
            (Document.ai_summary.ilike(search_term))
        )

    # Sorting
    if sort_by == "expiry_date":
        order_col = Document.expiry_date
    elif sort_by == "title":
        order_col = Document.title
    else:
        order_col = Document.created_at

    query = query.order_by(desc(order_col) if sort_order == "desc" else asc(order_col))

    res = await db.execute(query)
    docs = res.scalars().all()
    return docs

@router.get("/{document_id}", response_model=DocumentDetailResponse)
async def get_document(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves complete details of a single document including extracted fields and preview URL.
    """
    stmt = select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    preview_url = storage_service.get_preview_url(doc.file_path, doc.id)

    return DocumentDetailResponse(
        id=doc.id,
        user_id=doc.user_id,
        title=doc.title,
        document_type=doc.document_type,
        category=doc.category,
        status=doc.status,
        file_path=doc.file_path,
        mime_type=doc.mime_type,
        file_size_bytes=doc.file_size_bytes,
        confidence_score=doc.confidence_score,
        raw_ocr_text=doc.raw_ocr_text,
        normalized_text=doc.normalized_text,
        ai_summary=doc.ai_summary,
        user_confirmed=doc.user_confirmed,
        issue_date=doc.issue_date,
        expiry_date=doc.expiry_date,
        due_date=doc.due_date,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        preview_url=preview_url,
        fields=[
            DocumentFieldSchema.from_orm(f) for f in doc.fields
        ]
    )

@router.post("/{document_id}/confirm", response_model=DocumentDetailResponse)
async def confirm_document_fields(
    document_id: str,
    req: DocumentConfirmRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Human verification step: user confirms or edits the AI-extracted fields.
    """
    stmt = select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    if req.title:
        doc.title = req.title
    if req.document_type:
        doc.document_type = req.document_type
    if req.category:
        doc.category = req.category
    if req.issue_date is not None:
        doc.issue_date = req.issue_date
    if req.expiry_date is not None:
        doc.expiry_date = req.expiry_date
    if req.due_date is not None:
        doc.due_date = req.due_date

    # Update or insert fields
    if req.fields:
        # Clear previous fields and recreate with confirmed values
        await db.execute(delete(DocumentField).where(DocumentField.document_id == document_id))
        for f in req.fields:
            new_f = DocumentField(
                document_id=doc.id,
                field_name=f.field_name,
                field_value=f.field_value,
                confidence=1.0,
                is_user_edited=True
            )
            db.add(new_f)

    doc.user_confirmed = True
    doc.confidence_score = 1.0
    doc.status = compute_document_status(
        confidence_score=1.0,
        user_confirmed=True,
        expiry_date=doc.expiry_date,
        due_date=doc.due_date
    )

    await db.commit()
    await db.refresh(doc)

    preview_url = storage_service.get_preview_url(doc.file_path, doc.id)
    return DocumentDetailResponse(
        id=doc.id,
        user_id=doc.user_id,
        title=doc.title,
        document_type=doc.document_type,
        category=doc.category,
        status=doc.status,
        file_path=doc.file_path,
        mime_type=doc.mime_type,
        file_size_bytes=doc.file_size_bytes,
        confidence_score=doc.confidence_score,
        raw_ocr_text=doc.raw_ocr_text,
        normalized_text=doc.normalized_text,
        ai_summary=doc.ai_summary,
        user_confirmed=doc.user_confirmed,
        issue_date=doc.issue_date,
        expiry_date=doc.expiry_date,
        due_date=doc.due_date,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
        preview_url=preview_url,
        fields=[DocumentFieldSchema.from_orm(f) for f in doc.fields]
    )

@router.patch("/{document_id}", response_model=DocumentDetailResponse)
async def update_document(
    document_id: str,
    req: DocumentUpdateRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Updates document metadata or extracted fields."""
    return await confirm_document_fields(document_id, DocumentConfirmRequest(**req.dict(exclude_unset=True)), current_user, db)

@router.delete("/{document_id}", status_code=204)
async def delete_document(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Permanently deletes document, file from storage, and all associated data."""
    stmt = select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    storage_service.delete_file(doc.file_path)
    await db.delete(doc)
    await db.commit()
    return Response(status_code=204)

@router.get("/{document_id}/processing-status", response_model=ProcessingStatusResponse)
async def get_processing_status(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns async processing job status and progress bar percentage."""
    stmt = select(ProcessingJob).where(ProcessingJob.document_id == document_id)
    res = await db.execute(stmt)
    job = res.scalars().first()
    if not job:
        return ProcessingStatusResponse(
            document_id=document_id,
            status="completed",
            step="complete",
            progress_percentage=100
        )

    return ProcessingStatusResponse(
        document_id=document_id,
        status=job.status,
        step=job.step,
        progress_percentage=job.progress_percentage,
        error_message=job.error_message,
        completed_at=job.completed_at
    )

@router.get("/{document_id}/file")
async def get_document_file(
    document_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Streams file for in-browser preview."""
    stmt = select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    res = await db.execute(stmt)
    doc = res.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_bytes = storage_service.get_file_bytes(doc.file_path)
    if not file_bytes:
        raise HTTPException(status_code=404, detail="File content not found on server")

    return StreamingResponse(io.BytesIO(file_bytes), media_type=doc.mime_type)
