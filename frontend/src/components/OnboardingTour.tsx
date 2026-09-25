import React, { useEffect } from 'react';
import { 
  X, ArrowRight, ArrowLeft, Check, Sparkles, LayoutDashboard, 
  FolderKanban, Bell, Bot, Camera, HelpCircle, RotateCcw, Compass
} from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingTourProps {
  onNavigateTab?: (tab: string) => void;
  onOpenUpload?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  onNavigateTab,
  onOpenUpload
}) => {
  const { 
    isOnboardingOpen, 
    currentStep, 
    totalSteps, 
    nextStep, 
    prevStep, 
    goToStep, 
    skipTour, 
    finishTour, 
    replayTour 
  } = useOnboarding();
  const { t, isRtl, language } = useLanguage();

  // Keyboard navigation
  useEffect(() => {
    if (!isOnboardingOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipTour();
      } else if (e.key === 'ArrowRight') {
        if (isRtl) prevStep();
        else nextStep();
      } else if (e.key === 'ArrowLeft') {
        if (isRtl) nextStep();
        else prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOnboardingOpen, isRtl, nextStep, prevStep, skipTour]);

  if (!isOnboardingOpen) return null;

  const tourSteps = [
    {
      id: 'welcome',
      icon: Compass,
      color: 'text-sand bg-sand/10 border-sand/30',
      title: t('tour_welcome_title'),
      desc: t('tour_welcome_desc'),
      targetTab: 'dashboard',
      preview: {
        badge: 'Private & Secure AI',
        highlight: 'Zero Data Leaks • Isolated Per User • Bilingual Arabic/English'
      }
    },
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      title: t('tour_dashboard_title'),
      desc: t('tour_dashboard_desc'),
      targetTab: 'dashboard',
      preview: {
        badge: 'Count-Up KPI Cards',
        highlight: '7 Total Documents • 2 Expiring Soon • Live Day Countdowns'
      }
    },
    {
      id: 'documents',
      icon: FolderKanban,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      title: t('tour_documents_title'),
      desc: t('tour_documents_desc'),
      targetTab: 'documents',
      preview: {
        badge: 'Categorized Vault',
        highlight: 'Personal • Vehicle • Home • Finance • Deep OCR Search'
      }
    },
    {
      id: 'reminders',
      icon: Bell,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      title: t('tour_reminders_title'),
      desc: t('tour_reminders_desc'),
      targetTab: 'reminders',
      preview: {
        badge: 'Urgency Levels',
        highlight: 'Overdue • Due in <7 days • Due in <30 days • Official Renewal Steps'
      }
    },
    {
      id: 'assistant',
      icon: Bot,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      title: t('tour_assistant_title'),
      desc: t('tour_assistant_desc'),
      targetTab: 'assistant',
      preview: {
        badge: 'Grounded in Your Vault',
        highlight: 'Direct Citations • Gemini Powered • Zero Hallucinations'
      }
    },
    {
      id: 'upload',
      icon: Camera,
      color: 'text-sand bg-sand/10 border-sand/30',
      title: t('tour_upload_title'),
      desc: t('tour_upload_desc'),
      action: 'upload',
      preview: {
        badge: 'Human Verification Review',
        highlight: 'OCR Ingestion • AI Field Extraction • Edit & Confirm Before Saving'
      }
    },
    {
      id: 'tracker',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      title: t('tour_tracker_title'),
      desc: t('tour_tracker_desc'),
      targetTab: 'dashboard',
      preview: {
        badge: 'Daily Habit Tracker',
        highlight: '+1 / +5 Fast Logging • Custom Goals • Persistent Browser Streak'
      }
    },
    {
      id: 'help_icons',
      icon: HelpCircle,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
      title: t('tour_help_title'),
      desc: t('tour_help_desc'),
      targetTab: 'dashboard',
      preview: {
        badge: 'Replay Anytime',
        highlight: 'Tap Help (?) on any tab to view its purpose • Replay tour in 1 click'
      }
    }
  ];

  const step = tourSteps[currentStep] || tourSteps[0];
  const StepIcon = step.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  const handleExploreTab = () => {
    if (step.action === 'upload') {
      if (onOpenUpload) onOpenUpload();
    } else if (step.targetTab && onNavigateTab) {
      onNavigateTab(step.targetTab);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Bar with Step indicator & Skip */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#07151D]/90">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sand animate-ping" />
            <span className="text-xs font-semibold text-sand uppercase tracking-wider">
              {t('tour_step_indicator', { current: currentStep + 1, total: totalSteps })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={skipTour}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {t('tour_skip')}
            </button>
            <button
              onClick={skipTour}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close Tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Line */}
        <div className="w-full bg-slate-800 h-1 relative">
          <div 
            className="bg-gradient-to-r from-sand to-amber-500 h-1 transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Tour Content Card */}
        <div className="p-6 space-y-5 flex-1">
          {/* Main Step Header */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 shadow-lg ${step.color}`}>
              <StepIcon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white leading-tight">
                {step.title}
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </div>

          {/* Interactive Feature Visual Preview */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-sand uppercase tracking-wider px-2 py-0.5 rounded-full bg-sand/10 border border-sand/20">
                {step.preview.badge}
              </span>
              <button
                onClick={handleExploreTab}
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 hover:underline flex items-center gap-1 transition-colors"
              >
                <span>{t('tour_try_tab')}</span>
                <ArrowRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <p className="text-xs font-medium text-slate-300 pt-1">
              {step.preview.highlight}
            </p>
          </div>

          {/* Interactive Clickable Step Dots */}
          <div className="pt-2 flex items-center justify-center gap-1.5">
            {tourSteps.map((s, idx) => {
              const isCurrent = idx === currentStep;
              const isPassed = idx < currentStep;
              return (
                <button
                  key={s.id}
                  onClick={() => goToStep(idx)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    isCurrent 
                      ? 'w-6 bg-sand' 
                      : isPassed 
                        ? 'w-2 bg-slate-600 hover:bg-slate-500' 
                        : 'w-2 bg-slate-800 hover:bg-slate-700'
                  }`}
                  aria-label={`Jump to step ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#07151D]/90 flex items-center justify-between gap-3">
          <div>
            {!isFirst ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                <span>{t('tour_back')}</span>
              </button>
            ) : (
              <button
                onClick={skipTour}
                className="text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                {t('tour_skip')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLast ? (
              <>
                <button
                  onClick={replayTour}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                  title="Replay from step 1"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-sand" />
                  <span>{t('tour_replay')}</span>
                </button>
                <button
                  onClick={finishTour}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-sand text-slate-950 hover:bg-sand/90 transition-transform active:scale-95 shadow-md shadow-sand/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{t('tour_finish')}</span>
                </button>
              </>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-sand text-slate-950 hover:bg-sand/90 transition-transform active:scale-95 shadow-md shadow-sand/20"
              >
                <span>{t('tour_next')}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
