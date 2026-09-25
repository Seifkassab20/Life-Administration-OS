import uuid
import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, Date, DateTime, ForeignKey, Index
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    locale = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    document_type = Column(String(50), nullable=False, default="other", index=True)
    category = Column(String(50), nullable=False, default="other", index=True)
    file_path = Column(String(1024), nullable=False)
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    status = Column(String(50), nullable=False, default="processing", index=True)
    confidence_score = Column(Float, default=0.0)
    raw_ocr_text = Column(Text, nullable=True)
    normalized_text = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    user_confirmed = Column(Boolean, default=False)
    issue_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True, index=True)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    fields = relationship("DocumentField", back_populates="document", cascade="all, delete-orphan", lazy="selectin")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan", lazy="selectin")
    reminders = relationship("Reminder", back_populates="document", cascade="all, delete-orphan", lazy="selectin")
    jobs = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan", lazy="selectin")

class DocumentField(Base):
    __tablename__ = "document_fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False)
    field_value = Column(Text, nullable=False)
    confidence = Column(Float, default=1.0)
    is_user_edited = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="fields")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    page_number = Column(Integer, default=1)
    chunk_index = Column(Integer, default=0)
    content = Column(Text, nullable=False)
    # Stored as JSON string or comma-separated for SQLite fallback, or vector when pgvector is active
    embedding_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="chunks")

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=False, index=True)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    reminder_type = Column(String(50), default="expiration")
    target_date = Column(Date, nullable=False)
    days_before = Column(Integer, default=30)
    reminder_date = Column(Date, nullable=False, index=True)
    is_sent = Column(Boolean, default=False)
    is_dismissed = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="reminders")

class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    step = Column(String(100), default="queued")     # queued, reading, classifying, extracting, complete
    progress_percentage = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    document = relationship("Document", back_populates="jobs")
