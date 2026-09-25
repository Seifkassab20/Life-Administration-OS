import React from 'react';
import { 
  Car, User, Home, Briefcase, GraduationCap, Receipt, FileText, 
  Clock, Calendar, ChevronRight, ShieldCheck 
} from 'lucide-react';
import { DocumentItem, DocumentType, DocumentCategory } from '../types';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

interface DocumentCardProps {
  document: DocumentItem;
  onClick: () => void;
}

export const getCategoryIcon = (category: DocumentCategory | DocumentType) => {
  switch (category) {
    case 'vehicle':
    case 'vehicle_license':
    case 'vehicle_insurance':
      return Car;
    case 'personal':
    case 'national_id':
      return User;
    case 'home':
    case 'rental_contract':
      return Home;
    case 'utility_bill':
    case 'finance':
      return Receipt;
    case 'education':
    case 'certificate':
      return GraduationCap;
    case 'work':
    case 'work_contract':
      return Briefcase;
    default:
      return FileText;
  }
};

export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  const { t } = useLanguage();
  const Icon = getCategoryIcon(document.document_type || document.category);

  // Compute countdown
  const targetDateStr = document.expiry_date || document.due_date;
  let countdownText: string | null = null;
  let isUrgent = false;

  if (targetDateStr) {
    const targetDate = new Date(targetDateStr);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      countdownText = t('status_expired');
      isUrgent = true;
    } else if (document.due_date) {
      countdownText = t('dueInDays', { days: diffDays });
      isUrgent = diffDays <= 7;
    } else {
      countdownText = t('expiresInDays', { days: diffDays });
      isUrgent = diffDays <= 30;
    }
  }

  return (
    <div
      onClick={onClick}
      className="glass-card glass-panel-hover group p-5 rounded-2xl cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-brand-400 group-hover:scale-105 group-hover:bg-brand-500/10 group-hover:border-brand-500/30 transition-all duration-200">
            <Icon className="w-5 h-5" />
          </div>
          <StatusBadge status={document.status} />
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-slate-100 group-hover:text-brand-400 transition-colors line-clamp-2 mb-1">
          {document.title}
        </h3>

        {/* Category Label */}
        <p className="text-xs text-slate-400 mb-3 flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          {t(`cat_${document.category}`)}
        </p>

        {/* AI Summary Excerpt */}
        {document.ai_summary && (
          <p className="text-xs text-slate-400/90 line-clamp-2 bg-slate-900/40 p-2 rounded-lg border border-slate-800/40 mb-3">
            {document.ai_summary}
          </p>
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        {countdownText ? (
          <div className={`flex items-center gap-1.5 font-semibold ${isUrgent ? 'text-amber-400' : 'text-slate-300'}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{countdownText}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(document.created_at).toLocaleDateString()}</span>
          </div>
        )}

        <div className="w-6 h-6 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-brand-400 group-hover:bg-brand-500/20 transition-all">
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </div>
      </div>
    </div>
  );
};
