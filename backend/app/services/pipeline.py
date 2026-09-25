import json
import logging
import datetime
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update

from app.models import Document, DocumentField, DocumentChunk, Reminder, ProcessingJob
from app.services.storage import storage_service
from app.services.ocr import ocr_service
from app.services.classifier import classifier
from app.services.extractor import extractor
from app.services.embeddings import embedding_service
from app.services.reminders import compute_document_status, generate_automatic_reminders

logger = logging.getLogger("life_admin.pipeline")

class DocumentProcessingPipeline:
    async def process_document(
        self,
        db: AsyncSession,
        document_id: str,
        user_id: str
    ) -> bool:
        """
        Executes end-to-end processing pipeline for a document.
        Updates processing job steps asynchronously.
        """
        # Fetch document
        doc_stmt = select(Document).where(Document.id == document_id, Document.user_id == user_id)
        res = await db.execute(doc_stmt)
        document = res.scalars().first()
        if not document:
            logger.error(f"Document {document_id} not found for user {user_id}")
            return False

        # Create or fetch processing job
        job_stmt = select(ProcessingJob).where(ProcessingJob.document_id == document_id)
        job_res = await db.execute(job_stmt)
        job = job_res.scalars().first()
        if not job:
            job = ProcessingJob(
                document_id=document_id,
                status="processing",
                step="reading",
                progress_percentage=10
            )
            db.add(job)
            await db.commit()

        try:
            # Step 1: Read File
            job.step = "reading"
            job.progress_percentage = 20
            await db.commit()

            file_bytes = storage_service.get_file_bytes(document.file_path)
            if not file_bytes:
                # If file not on disk/supabase yet, simulate empty fallback
                file_bytes = b""

            # Step 2: OCR & Text Normalization
            raw_text, normalized_text, pages = ocr_service.process_document(file_bytes, document.mime_type)
            document.raw_ocr_text = raw_text
            document.normalized_text = normalized_text

            job.step = "understanding"
            job.progress_percentage = 40
            await db.commit()

            # Step 3: Document Classification
            doc_type, category, confidence = classifier.classify(normalized_text, document.title)
            # Only override document_type if not manually specified or is 'other'
            if document.document_type == "other" or not document.document_type:
                document.document_type = doc_type
                document.category = category
            document.confidence_score = confidence

            # Step 4: Information Extraction & Date Detection
            job.step = "extracting"
            job.progress_percentage = 65
            await db.commit()

            extraction_result = extractor.extract(document.document_type, normalized_text)
            document.ai_summary = extraction_result["ai_summary"]
            document.issue_date = extraction_result["issue_date"]
            document.expiry_date = extraction_result["expiry_date"]
            document.due_date = extraction_result["due_date"]

            # Save extracted fields
            for f in extraction_result["fields"]:
                field_obj = DocumentField(
                    document_id=document.id,
                    field_name=f["field_name"],
                    field_value=f["field_value"],
                    confidence=f.get("confidence", 0.95),
                    is_user_edited=False
                )
                db.add(field_obj)

            # Step 5: Automatic Reminders
            target_date = document.expiry_date or document.due_date
            if target_date:
                rem_type = "expiration" if document.expiry_date else "due_date"
                reminders_data = generate_automatic_reminders(
                    user_id=user_id,
                    document_id=document.id,
                    document_title=document.title,
                    target_date=target_date,
                    reminder_type=rem_type
                )
                for r in reminders_data:
                    rem_obj = Reminder(**r)
                    db.add(rem_obj)

            # Step 6: Chunking & Embeddings Generation
            job.step = "embedding"
            job.progress_percentage = 85
            await db.commit()

            # Create text chunks (page by page or section chunks)
            chunks_to_create = []
            if pages and any(p["text"] for p in pages):
                for p in pages:
                    if p["text"].strip():
                        chunks_to_create.append((p["page_number"], p["text"].strip()))
            else:
                # Fallback chunking with extracted fields context
                field_summary = "\n".join([f"{f['field_name']}: {f['field_value']}" for f in extraction_result["fields"]])
                content = f"Document: {document.title}\nType: {document.document_type}\n{field_summary}\n{document.ai_summary}"
                chunks_to_create.append((1, content))

            for idx, (pg_no, chunk_text) in enumerate(chunks_to_create):
                emb = embedding_service.generate_embedding(chunk_text)
                chunk_obj = DocumentChunk(
                    document_id=document.id,
                    user_id=user_id,
                    page_number=pg_no,
                    chunk_index=idx,
                    content=chunk_text,
                    embedding_json=json.dumps(emb)
                )
                db.add(chunk_obj)

            # Compute final status
            document.status = compute_document_status(
                confidence_score=document.confidence_score,
                user_confirmed=document.user_confirmed,
                expiry_date=document.expiry_date,
                due_date=document.due_date
            )

            job.step = "complete"
            job.status = "completed"
            job.progress_percentage = 100
            job.completed_at = datetime.datetime.utcnow()

            await db.commit()
            logger.info(f"Successfully processed document {document_id} as {document.document_type}")
            return True

        except Exception as e:
            logger.error(f"Error processing document {document_id}: {e}", exc_info=True)
            job.status = "failed"
            job.error_message = str(e)
            document.status = "error"
            await db.commit()
            return False

processing_pipeline = DocumentProcessingPipeline()
