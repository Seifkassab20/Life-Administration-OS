import React from 'react';
import { DocumentStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface StatusBadgeProps {
  status: DocumentStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useLanguage();

  switch (status) {
    case 'safe':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/15 text-teal-300 border border-teal-500/25 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          {t('status_safe')}
        </span>
      );
    case 'attention_soon':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sand/15 text-sand border border-sand/30 animate-pulse-subtle ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sand"></span>
          {t('status_attention_soon')}
        </span>
      );
    case 'expired':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/25 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          {t('status_expired')}
        </span>
      );
    case 'needs_review':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-terracotta/20 text-[#e6b9af] border border-terracotta/40 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-terracotta"></span>
          {t('status_needs_review')}
        </span>
      );
    case 'processing':
    case 'uploading':
    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-dusk-800/60 text-sand border border-sand/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-sand animate-ping"></span>
          {t('status_processing')}
        </span>
      );
  }
};
