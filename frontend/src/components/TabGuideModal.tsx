import React, { useState, useEffect } from 'react';
import { 
  X, LayoutDashboard, FolderKanban, Bell, Bot, Camera, Sparkles, 
  ArrowRight, Compass, CheckCircle2, Zap, HelpCircle
} from 'lucide-react';
import { useOnboarding, TAB_GUIDE_ITEMS, TabGuideInfo } from '../context/OnboardingContext';
import { useLanguage } from '../context/LanguageContext';

interface TabGuideModalProps {
  onNavigateTab?: (tab: string) => void;
  onOpenUpload?: () => void;
}

export const TabGuideModal: React.FC<TabGuideModalProps> = ({
  onNavigateTab,
  onOpenUpload
}) => {
  const { isTabGuideOpen, selectedGuideTabId, closeTabGuide, startTour } = useOnboarding();
  const { language, t, isRtl } = useLanguage();
  const [activeTabId, setActiveTabId] = useState<string>('dashboard');

  useEffect(() => {
    if (selectedGuideTabId && TAB_GUIDE_ITEMS[selectedGuideTabId]) {
      setActiveTabId(selectedGuideTabId);
    }
  }, [selectedGuideTabId, isTabGuideOpen]);

  if (!isTabGuideOpen) return null;

  const currentItem = TAB_GUIDE_ITEMS[activeTabId] || TAB_GUIDE_ITEMS['dashboard'];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-5 h-5 text-sky-400" />;
      case 'FolderKanban': return <FolderKanban className="w-5 h-5 text-amber-400" />;
      case 'Bell': return <Bell className="w-5 h-5 text-rose-400" />;
      case 'Bot': return <Bot className="w-5 h-5 text-emerald-400" />;
      case 'Camera': return <Camera className="w-5 h-5 text-sand" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-purple-400" />;
      default: return <HelpCircle className="w-5 h-5 text-brand-400" />;
    }
  };

  const handleGoToTab = () => {
    closeTabGuide();
    if (activeTabId === 'upload') {
      if (onOpenUpload) onOpenUpload();
    } else if (onNavigateTab) {
      onNavigateTab(activeTabId);
    }
  };

  const handleLaunchTour = () => {
    closeTabGuide();
    startTour(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#07151D]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sand/10 border border-sand/30 flex items-center justify-center text-sand">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>{t('tab_guide_title')}</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-sand/10 text-sand border border-sand/30">
                  {language === 'ar' ? 'دليل الاستخدام' : 'Interactive Guide'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {t('tab_guide_subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={closeTabGuide}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector Pills */}
        <div className="px-6 py-3 bg-slate-950/50 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
          {Object.values(TAB_GUIDE_ITEMS).map((item) => {
            const isSelected = item.id === activeTabId;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTabId(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-sand text-slate-950 font-bold shadow-md shadow-sand/20 scale-[1.02]'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {getIcon(item.iconName)}
                <span>{item.name[language]}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Detail */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {/* Active Tab Header Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900 border border-slate-700/60 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner">
              {getIcon(currentItem.iconName)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {currentItem.name[language]}
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-sand/15 text-sand border border-sand/30">
                  {currentItem.badge[language]}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentItem.meaning[language]}
              </p>
            </div>
          </div>

          {/* Primary Purpose */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-sand uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>{t('purpose_label')}</span>
            </div>
            <p className="text-sm text-slate-200 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
              {currentItem.purpose[language]}
            </p>
          </div>

          {/* When to Tap */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>{t('when_to_tap')}</span>
            </div>
            <p className="text-sm text-slate-200 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
              {currentItem.whenToTap[language]}
            </p>
          </div>

          {/* Key Actions Available */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('key_actions')}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentItem.actions[language].map((act, idx) => (
                <div 
                  key={idx} 
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="leading-snug">{act}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Superpower */}
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                {t('ai_powers')}
              </span>
              <p className="text-xs text-purple-200/90 mt-0.5 leading-relaxed">
                {currentItem.aiSuperpower[language]}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#07151D]/90 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleLaunchTour}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Compass className="w-4 h-4 text-sand" />
            <span>{t('tour_start')}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={closeTabGuide}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              {t('close_guide')}
            </button>
            <button
              onClick={handleGoToTab}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sand text-slate-950 hover:bg-sand/90 transition-transform active:scale-95 shadow-md shadow-sand/20"
            >
              <span>{t('open_tab_now')} ({currentItem.name[language]})</span>
              <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
