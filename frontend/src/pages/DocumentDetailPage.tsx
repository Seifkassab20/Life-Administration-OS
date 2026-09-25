import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Download, Trash2, Edit3, Bot, Calendar, 
  Clock, ShieldCheck, FileText, CheckCircle2, AlertTriangle, 
  ExternalLink, Eye, Share2, Sparkles 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { DocumentItem, DocumentField } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { HumanVerificationModal } from '../components/HumanVerificationModal';

interface DocumentDetailPageProps {
  documentId: string;
  onBack: () => void;
  onAskAboutDoc: (docId: string, title: string) => void;
}

export const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({
  documentId,
  onBack,
  onAskAboutDoc,
}) => {
  const { t } = useLanguage();
  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.getDocument(documentId);
        setDoc(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [documentId]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this document and its data?')) return;
    setIsDeleting(true);
    try {
      await api.deleteDocument(documentId);
      onBack();
    } catch (err) {
      alert('Delete failed');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-400 text-xs">
        Loading document details...
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="text-center py-20 space-y-3">
        <p className="text-sm text-slate-300">Document not found.</p>
        <button onClick={onBack} className="text-xs text-brand-400 underline">
          Back to Documents
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* Back button & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          <span>Back to Library</span>
        </button>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskAboutDoc(doc.id, doc.title)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold gradient-brand text-white shadow-md shadow-brand-500/20 hover:opacity-95 flex items-center gap-1.5 transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{t('askDocAction')}</span>
          </button>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{t('editBtn')}</span>
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 transition-colors"
            title="Delete Document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Document Header Card */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
                {t(`cat_${doc.category}`)}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">
                {t(`type_${doc.document_type}`)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {doc.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Uploaded on {new Date(doc.created_at).toLocaleDateString()} • {(doc.file_size_bytes / 1024).toFixed(1)} KB
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={doc.status} className="text-sm px-3.5 py-1" />
          </div>
        </div>
      </div>

      {/* Grid: Left Pane (Preview) & Right Pane (Structured Intelligence) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Document Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-4 rounded-3xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-brand-400" />
                <span>Document Preview</span>
              </h3>
              <span className="text-[11px] text-slate-500">{doc.mime_type}</span>
            </div>

            {/* Document preview container */}
            <div className="w-full aspect-[3/4] bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center relative p-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-semibold text-white max-w-[80%] truncate">
                {doc.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-[70%]">
                Digital preview rendered from secure storage
              </p>

              {doc.preview_url && (
                <a
                  href={doc.preview_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Full Document</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Extracted Structured Information (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Important Dates Card */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sand" />
              <span>Important Dates & Timeline</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doc.issue_date && (
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-slate-400 block font-medium">Issue / Start Date</span>
                  <span className="text-sm font-bold text-slate-200 mt-0.5 block">
                    {new Date(doc.issue_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </span>
                </div>
              )}

              {doc.expiry_date && (
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-sand block font-medium">Expiration / Renewal Date</span>
                  <span className="text-sm font-bold text-sand mt-0.5 block">
                    {new Date(doc.expiry_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </span>
                </div>
              )}

              {doc.due_date && (
                <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800">
                  <span className="text-[11px] text-terracotta block font-medium">Payment Due Date</span>
                  <span className="text-sm font-bold text-sand mt-0.5 block">
                    {new Date(doc.due_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* AI Summary Card */}
          {doc.ai_summary && (
            <div className="glass-card p-5 rounded-3xl border border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>AI Intelligence Summary</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
                {doc.ai_summary}
              </p>
            </div>
          )}

          {/* Structured Key-Value Fields */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-400" />
                <span>Extracted Information</span>
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">
                {doc.fields?.length || 0} fields verified
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {doc.fields && doc.fields.length > 0 ? (
                doc.fields.map((f, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400 font-medium">{f.field_name}</span>
                    <span className="text-xs font-semibold text-slate-100 text-right max-w-[60%]">
                      {f.field_value}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-3">No custom fields extracted.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Edit / Human Verification Modal */}
      <HumanVerificationModal
        document={doc}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onConfirmed={(updated) => setDoc(updated)}
      />
    </div>
  );
};
