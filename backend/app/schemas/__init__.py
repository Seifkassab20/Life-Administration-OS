import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Auth Schemas ---
class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = "User"

class UserLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: Optional[str] = None

class UserProfileResponse(BaseModel):
    user_id: str
    email: str
    full_name: Optional[str] = None
    locale: str = "en"
    created_at: datetime.datetime

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    locale: Optional[str] = None

# --- Document Schemas ---
class DocumentFieldSchema(BaseModel):
    id: Optional[str] = None
    field_name: str
    field_value: str
    confidence: float = 1.0
    is_user_edited: bool = False

    class Config:
        from_attributes = True

class DocumentFieldUpdate(BaseModel):
    field_name: str
    field_value: str

class DocumentSummary(BaseModel):
    id: str
    user_id: str
    title: str
    document_type: str
    category: str
    status: str
    file_path: str
    mime_type: str
    file_size_bytes: int
    confidence_score: float
    user_confirmed: bool
    issue_date: Optional[datetime.date] = None
    expiry_date: Optional[datetime.date] = None
    due_date: Optional[datetime.date] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

class DocumentDetailResponse(DocumentSummary):
    raw_ocr_text: Optional[str] = None
    normalized_text: Optional[str] = None
    ai_summary: Optional[str] = None
    preview_url: Optional[str] = None
    fields: List[DocumentFieldSchema] = []

    class Config:
        from_attributes = True

class DocumentConfirmRequest(BaseModel):
    title: Optional[str] = None
    document_type: Optional[str] = None
    category: Optional[str] = None
    fields: Optional[List[DocumentFieldUpdate]] = None
    issue_date: Optional[datetime.date] = None
    expiry_date: Optional[datetime.date] = None
    due_date: Optional[datetime.date] = None

class DocumentUpdateRequest(BaseModel):
    title: Optional[str] = None
    document_type: Optional[str] = None
    category: Optional[str] = None
    fields: Optional[List[DocumentFieldUpdate]] = None
    issue_date: Optional[datetime.date] = None
    expiry_date: Optional[datetime.date] = None
    due_date: Optional[datetime.date] = None
    user_confirmed: Optional[bool] = None

class ProcessingStatusResponse(BaseModel):
    document_id: str
    status: str
    step: str
    progress_percentage: int
    error_message: Optional[str] = None
    completed_at: Optional[datetime.datetime] = None

# --- Reminder Schemas ---
class ReminderCreate(BaseModel):
    document_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    reminder_type: str = "expiration"
    target_date: datetime.date
    days_before: int = 30

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    target_date: Optional[datetime.date] = None
    days_before: Optional[int] = None
    is_dismissed: Optional[bool] = None

class ReminderResponse(BaseModel):
    id: str
    user_id: str
    document_id: Optional[str] = None
    document_title: Optional[str] = None
    title: str
    description: Optional[str] = None
    reminder_type: str
    target_date: datetime.date
    days_before: int
    reminder_date: datetime.date
    days_remaining: int
    is_sent: bool
    is_dismissed: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- Assistant & RAG Schemas ---
class AssistantSource(BaseModel):
    document_id: str
    document_title: str
    document_type: str
    page_number: int = 1
    excerpt: str
    confidence: float = 0.95

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class AssistantChatRequest(BaseModel):
    message: str
    document_id: Optional[str] = None
    history: Optional[List[ChatMessage]] = []

class AssistantChatResponse(BaseModel):
    answer: str
    sources: List[AssistantSource] = []
    grounded: bool = True
    suggested_actions: Optional[List[str]] = []

# --- Search Schemas ---
class SearchResultItem(BaseModel):
    document: DocumentSummary
    score: float
    match_type: str # 'exact', 'keyword', 'semantic'
    matched_snippet: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    total_results: int
    results: List[SearchResultItem]

# --- Dashboard Schemas ---
class ExpiringDocumentItem(BaseModel):
    id: str
    title: str
    document_type: str
    category: str
    expiry_date: datetime.date
    days_left: int
    status: str

class DashboardSummaryResponse(BaseModel):
    greeting: str
    total_documents: int
    expiring_soon_count: int
    needs_attention_count: int
    recently_added_count: int
    expiring_documents: List[ExpiringDocumentItem]
    recent_documents: List[DocumentSummary]
    upcoming_reminders: List[ReminderResponse]
