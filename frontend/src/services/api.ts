import {
  DocumentItem,
  DocumentField,
  ReminderItem,
  DashboardData,
  AssistantSource,
  SearchResultItem,
  UserProfile,
  ProcessingStatus
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('laos_token') || 'demo-token';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // --- Auth ---
  async login(email: string): Promise<{ access_token: string; user_id: string; full_name: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });
      if (!res.ok) throw new Error('Login failed');
      return await res.json();
    } catch {
      return {
        access_token: 'demo-token',
        user_id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Seif Kassab'
      };
    }
  }

  async getProfile(): Promise<UserProfile> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to get profile');
      return await res.json();
    } catch {
      return {
        user_id: '00000000-0000-0000-0000-000000000001',
        email: 'seif@example.com',
        full_name: 'Seif Kassab',
        locale: 'en',
        created_at: new Date().toISOString()
      };
    }
  }

  // --- Dashboard ---
  async getDashboard(): Promise<DashboardData> {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to get dashboard');
      return await res.json();
    } catch {
      // Fallback fallback dashboard
      return {
        greeting: 'Good evening, Seif 👋',
        total_documents: 7,
        expiring_soon_count: 2,
        needs_attention_count: 2,
        recently_added_count: 5,
        expiring_documents: [
          {
            id: 'doc-demo-utility-bill',
            title: 'Electricity Bill — South Cairo Distribution (فاتورة كهرباء)',
            document_type: 'utility_bill',
            category: 'home',
            expiry_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
            days_left: 5,
            status: 'attention_soon'
          },
          {
            id: 'doc-demo-vehicle-license',
            title: 'Vehicle License — Toyota Corolla (رخصة تسيير)',
            document_type: 'vehicle_license',
            category: 'vehicle',
            expiry_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
            days_left: 12,
            status: 'attention_soon'
          },
          {
            id: 'doc-demo-vehicle-insurance',
            title: 'Comprehensive Motor Insurance (وثيقة تأمين شامل)',
            document_type: 'vehicle_insurance',
            category: 'vehicle',
            expiry_date: new Date(Date.now() + 31 * 86400000).toISOString().split('T')[0],
            days_left: 31,
            status: 'safe'
          }
        ],
        recent_documents: [],
        upcoming_reminders: []
      };
    }
  }

  // --- Documents ---
  async getDocuments(params?: {
    category?: string;
    document_type?: string;
    status_filter?: string;
    search?: string;
    sort_by?: string;
  }): Promise<DocumentItem[]> {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== 'all') query.set('category', params.category);
      if (params?.document_type && params.document_type !== 'all') query.set('document_type', params.document_type);
      if (params?.status_filter && params.status_filter !== 'all') query.set('status_filter', params.status_filter);
      if (params?.search) query.set('search', params.search);
      if (params?.sort_by) query.set('sort_by', params.sort_by);

      const res = await fetch(`${API_BASE_URL}/documents?${query.toString()}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to get documents');
      return await res.json();
    } catch {
      return [];
    }
  }

  async getDocument(id: string): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Document not found');
    return await res.json();
  }

  async uploadDocument(file: File, title?: string, documentType?: string): Promise<DocumentItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (documentType) formData.append('document_type', documentType);

    const token = localStorage.getItem('laos_token') || 'demo-token';
    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
  }

  async confirmDocument(id: string, data: {
    title?: string;
    document_type?: string;
    category?: string;
    fields?: Array<{ field_name: string; field_value: string }>;
    expiry_date?: string | null;
    issue_date?: string | null;
    due_date?: string | null;
  }): Promise<DocumentItem> {
    const res = await fetch(`${API_BASE_URL}/documents/${id}/confirm`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Confirmation failed');
    return await res.json();
  }

  getFileUrl(documentId: string): string {
    return `${API_BASE_URL}/documents/${documentId}/file`;
  }

  getDownloadUrl(documentId: string): string {
    return `${API_BASE_URL}/documents/${documentId}/download`;
  }

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Delete failed');
  }

  async getProcessingStatus(id: string): Promise<ProcessingStatus> {
    try {
      const res = await fetch(`${API_BASE_URL}/documents/${id}/processing-status`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Status failed');
      return await res.json();
    } catch {
      return {
        document_id: id,
        status: 'completed',
        step: 'complete',
        progress_percentage: 100
      };
    }
  }

  // --- Reminders ---
  async getReminders(includeDismissed = false): Promise<ReminderItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/reminders?include_dismissed=${includeDismissed}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Failed to fetch reminders');
      return await res.json();
    } catch {
      return [];
    }
  }

  async createReminder(data: {
    document_id?: string;
    title: string;
    description?: string;
    target_date: string;
    days_before: number;
    reminder_type?: string;
  }): Promise<ReminderItem> {
    const res = await fetch(`${API_BASE_URL}/reminders`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Create reminder failed');
    return await res.json();
  }

  async dismissReminder(id: string): Promise<ReminderItem> {
    const res = await fetch(`${API_BASE_URL}/reminders/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ is_dismissed: true }),
    });
    if (!res.ok) throw new Error('Dismiss failed');
    return await res.json();
  }

  // --- Assistant & RAG ---
  async askAssistant(message: string, documentId?: string): Promise<{
    answer: string;
    sources: AssistantSource[];
    grounded: boolean;
    suggested_actions?: string[];
  }> {
    try {
      const res = await fetch(`${API_BASE_URL}/assistant/chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ message, document_id: documentId }),
      });
      if (!res.ok) throw new Error('Assistant query failed');
      return await res.json();
    } catch {
      return {
        answer: "I couldn't reach the document assistant service at the moment.",
        sources: [],
        grounded: false
      };
    }
  }

  // --- Hybrid Search ---
  async search(query: string, semantic = true): Promise<SearchResultItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}&semantic=${semantic}`, {
        headers: this.getHeaders(),
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      return data.results || [];
    } catch {
      return [];
    }
  }
}

export const api = new ApiService();
