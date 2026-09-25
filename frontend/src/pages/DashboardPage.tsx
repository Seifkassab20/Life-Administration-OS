import React, { useState, useEffect } from 'react';
import { 
  FileText, Clock, AlertTriangle, Sparkles, Send, 
  ArrowRight, Plus, CheckCircle2, ChevronRight, Search, 
  Car, Shield, User, Home, Receipt, Briefcase, GraduationCap 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardData, DocumentItem } from '../types';
import { DocumentCard, getCategoryIcon } from '../components/DocumentCard';
import { StatusBadge } from '../components/StatusBadge';
import { AnimatedCounter } from '../components/AnimatedCounter';
import { CounterWidget } from '../components/CounterWidget';

interface DashboardPageProps {
  onOpenUpload: () => void;
  onOpenAssistant: (query?: string) => void;
  onSelectDocument: (docId: string) => void;
  onNavigateDocuments: () => void;
  onNavigateReminders: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenUpload,
  onOpenAssistant,
  onSelectDocument,
  onNavigateDocuments,
  onNavigateReminders,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getDashboard();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    onOpenAssistant(aiQuery.trim());
  };

  const samplePrompts = [
    'When does my car license expire?',
    'How much was my latest electricity bill?',
    'Show me all documents related to my car',
    'Which documents expire this year?'
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Welcome & AI Assistant Prompt Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/5 relative overflow-hidden bg-gradient-to-br from-slate-900/90 to-slate-950/90 shadow-xl">
        <div className="max-w-3xl">
          <span className="text-xs uppercase font-bold tracking-wider text-brand-400">Personal Document Intelligence</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2">
            {data?.greeting || `Good evening, ${user?.full_name?.split(' ')[0] || 'Seif'} 👋`}
          </h1>
          <p className="text-sm text-slate-300 mb-6">
            Your life documents are organized, secure, and ready to answer your questions.
          </p>

          {/* Prominent AI Search/Chat Bar */}
          <form onSubmit={handleAiSubmit} className="relative">
            <div className="relative flex items-center">
              <Sparkles className="w-5 h-5 text-brand-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder={t('askAnythingPlaceholder')}
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-brand-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={!aiQuery.trim()}
                className="absolute right-2 px-4 py-2 rounded-xl text-xs font-semibold text-white gradient-brand shadow-md shadow-brand-500/25 hover:opacity-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Ask AI</span>
                <Send className="w-3.5 h-3.5 rtl:rotate-180" />
              </button>
            </div>
          </form>

          {/* Suggestion tags */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Try asking:</span>
            {samplePrompts.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onOpenAssistant(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Row with Smooth Count-Up Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Documents */}
        <div 
          onClick={onNavigateDocuments}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-slate-700 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('totalDocs')}</span>
            <FileText className="w-4 h-4 text-slate-400 group-hover:text-brand-400 transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            <AnimatedCounter value={data?.total_documents ?? 7} />
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Active stored records</span>
        </div>

        {/* Expiring Soon */}
        <div 
          onClick={onNavigateReminders}
          className="glass-card p-5 rounded-2xl border border-sand/30 bg-sand/5 hover:border-sand/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-sand">{t('expiringSoon')}</span>
            <Clock className="w-4 h-4 text-sand group-hover:scale-110 transition-transform" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-sand tracking-tight">
            <AnimatedCounter value={data?.expiring_soon_count ?? 2} />
          </p>
          <span className="text-[11px] text-sand/70 mt-1 block">Action needed in &lt; 90 days</span>
        </div>

        {/* Needs Attention */}
        <div 
          onClick={onNavigateDocuments}
          className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-terracotta/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">{t('needsAttention')}</span>
            <AlertTriangle className="w-4 h-4 text-terracotta group-hover:text-sand transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            <AnimatedCounter value={data?.needs_attention_count ?? 2} />
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">Pending review or updates</span>
        </div>

        {/* Quick Upload Action Card */}
        <div 
          onClick={onOpenUpload}
          className="glass-card p-5 rounded-2xl border border-sand/30 bg-sand/5 hover:border-sand/50 cursor-pointer transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-sand">Quick Upload</span>
            <div className="w-6 h-6 rounded-lg gradient-brand text-white flex items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-sm font-semibold text-white mt-1">Add New Document</p>
          <span className="text-[11px] text-slate-400 mt-1 block">PDF, JPG, or PNG</span>
        </div>
      </div>

      {/* Expiring Soon Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sand" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('expiringSoon')} & Upcoming Deadlines
            </h2>
          </div>
          <button
            onClick={onNavigateReminders}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            <span>View All Reminders</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.expiring_documents && data.expiring_documents.length > 0 ? (
            data.expiring_documents.map((item) => {
              const Icon = getCategoryIcon(item.document_type as any);
              const isUrgent = item.days_left <= 15;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectDocument(item.id)}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-sand/40 cursor-pointer transition-all duration-200 group flex items-start gap-3.5"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-sand shrink-0 group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white group-hover:text-sand transition-colors truncate">
                      {item.title}
                    </h3>
                    <p className={`text-xs font-bold mt-1 ${isUrgent ? 'text-sand' : 'text-slate-300'}`}>
                      Expires in <AnimatedCounter value={item.days_left} duration={700} /> days
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Deadline: {new Date(item.expiry_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-3 text-center py-8 glass-card rounded-2xl text-slate-400 text-xs">
              No documents expiring soon. All dates are safely on schedule!
            </div>
          )}
        </div>
      </div>

      {/* Interactive Activity & Document Counter Widget */}
      <CounterWidget />

      {/* Recent Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {t('recentlyAdded')}
            </h2>
          </div>
          <button
            onClick={onNavigateDocuments}
            className="text-xs text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1"
          >
            <span>{t('cat_all')} (<AnimatedCounter value={data?.total_documents ?? 7} />)</span>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.recent_documents && data.recent_documents.length > 0 ? (
            data.recent_documents.slice(0, 6).map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onClick={() => onSelectDocument(doc.id)}
              />
            ))
          ) : (
            /* Fallback preview cards if direct DB sync pending */
            <div className="col-span-3 text-center py-8 glass-card rounded-2xl text-slate-400 text-xs">
              Loading recent documents...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
