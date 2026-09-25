import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { useLanguage } from '../context/LanguageContext';

interface HelpIconProps {
  tabId?: string;
  label?: string;
  tooltipText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'pill' | 'glow';
  className?: string;
}

export const HelpIcon: React.FC<HelpIconProps> = ({
  tabId = 'dashboard',
  label,
  tooltipText,
  size = 'sm',
  variant = 'subtle',
  className = '',
}) => {
  const { openTabGuide } = useOnboarding();
  const { t, isRtl } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const buttonSizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2'
  };

  const defaultTooltip = tooltipText || t('tab_help_tooltip');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTabGuide(tabId);
  };

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sand/10 hover:bg-sand/20 text-sand border border-sand/30 hover:border-sand/50 transition-all shadow-sm active:scale-95 group ${className}`}
        title={defaultTooltip}
      >
        <HelpCircle className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
        <span>{label || t('tab_help_btn')}</span>
      </button>
    );
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={defaultTooltip}
        className={`${buttonSizeClasses[size]} rounded-full text-slate-400 hover:text-sand hover:bg-sand/10 transition-colors active:scale-90 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sand/40`}
      >
        <HelpCircle className={`${sizeClasses[size]} transition-transform hover:scale-110`} />
      </button>

      {/* Floating Hover Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className={`absolute bottom-full mb-2 z-50 pointer-events-none px-2.5 py-1.5 text-[11px] leading-tight font-medium text-slate-200 bg-slate-900/95 backdrop-blur-md rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150 ${
            isRtl ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'
          }`}
        >
          <span>{defaultTooltip}</span>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
};
