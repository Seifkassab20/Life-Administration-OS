export type DocumentCategory = 
  | 'all'
  | 'personal'
  | 'vehicle'
  | 'home'
  | 'work'
  | 'education'
  | 'finance'
  | 'other';

export type DocumentType = 
  | 'national_id'
  | 'vehicle_license'
  | 'vehicle_insurance'
  | 'rental_contract'
  | 'utility_bill'
  | 'certificate'
  | 'work_contract'
  | 'other';

export type DocumentStatus = 
  | 'uploading'
  | 'processing'
  | 'needs_review'
  | 'safe'
  | 'attention_soon'
  | 'expired'
  | 'error';

export interface DocumentField {
  id?: string;
  field_name: string;
  field_value: string;
  confidence: number;
  is_user_edited?: boolean;
}

export interface DocumentItem {
  id: string;
  user_id: string;
  title: string;
  document_type: DocumentType;
  category: DocumentCategory;
  status: DocumentStatus;
  file_path: string;
  mime_type: string;
  file_size_bytes: number;
  confidence_score: number;
  user_confirmed: boolean;
  issue_date?: string | null;
  expiry_date?: string | null;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  raw_ocr_text?: string;
  normalized_text?: string;
  ai_summary?: string;
  preview_url?: string;
  fields?: DocumentField[];
}

export interface ReminderItem {
  id: string;
  user_id: string;
  document_id?: string | null;
  document_title?: string | null;
  title: string;
  description?: string | null;
  reminder_type: string;
  target_date: string;
  days_before: number;
  reminder_date: string;
  days_remaining: number;
  is_sent: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface ProcessingStatus {
  document_id: string;
  status: string;
  step: string;
  progress_percentage: number;
  error_message?: string | null;
  completed_at?: string | null;
}

export interface ExpiringDocument {
  id: string;
  title: string;
  document_type: string;
  category: string;
  expiry_date: string;
  days_left: number;
  status: DocumentStatus;
}

export interface DashboardData {
  greeting: string;
  total_documents: number;
  expiring_soon_count: number;
  needs_attention_count: number;
  recently_added_count: number;
  expiring_documents: ExpiringDocument[];
  recent_documents: DocumentItem[];
  upcoming_reminders: ReminderItem[];
}

export interface AssistantSource {
  document_id: string;
  document_title: string;
  document_type: string;
  page_number: number;
  excerpt: string;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: AssistantSource[];
  grounded?: boolean;
  timestamp: string;
}

export interface SearchResultItem {
  document: DocumentItem;
  score: number;
  match_type: 'exact' | 'keyword' | 'semantic';
  matched_snippet?: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  locale: string;
  created_at: string;
}
