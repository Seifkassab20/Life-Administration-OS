import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  X, ArrowRight, ArrowLeft, Check, Sparkles, LayoutDashboard, 
  FolderKanban, Bell, Bot, Camera, HelpCircle, RotateCcw, Compass,
  ChevronDown, ChevronUp, MousePointerClick
} from 'lucide-react';
import { useOnboarding } from '../context/OnboardingContext';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingTourProps {
  onNavigateTab?: (tab: string) => void;
  onOpenUpload?: () => void;
}

interface StepConfig {
  id: string;
  targetSelector: string;
  targetTab?: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  titleKey: string;
  descKey: string;
  badge: { en: string; ar: string };
  highlight: { en: string; ar: string };
  preferredPlacement?: 'top' | 'bottom';
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

  const [targetRect, setTargetRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const [cardPlacement, setCardPlacement] = useState<'top' | 'bottom'>('bottom');
  const [isAnimating, setIsAnimating] = useState(false);

  const tourSteps: StepConfig[] = [
    {
      id: 'brand',
      targetSelector: '#tour-brand',
      targetTab: 'dashboard',
      icon: Compass,
      color: 'text-sand bg-sand/10 border-sand/30',
      titleKey: 'tour_welcome_title',
      descKey: 'tour_welcome_desc',
      badge: { en: 'Private & Secure OS', ar: 'نظام آمن ومشفر' },
      highlight: { 
        en: 'Isolated Per-User Vault • Zero Data Leaks • Bilingual AI', 
        ar: 'خزينة معزولة لكل مستخدم • خصوصية تامة • دعم كامل للعربية' 
      },
      preferredPlacement: 'bottom'
    },
    {
      id: 'ai-bar',
      targetSelector: '#tour-dashboard-ai-bar',
      targetTab: 'dashboard',
      icon: Bot,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
      titleKey: 'tour_assistant_title',
      descKey: 'tour_assistant_desc',
      badge: { en: 'Grounded Search Bar', ar: 'شريط البحث التوليدي' },
      highlight: { 
        en: 'Ask direct questions about licenses, contracts, bills, or dates', 
        ar: 'اطرح أي سؤال مباشرة عن رخصك، عقودك، فواتيرك، أو مواعيدك' 
      },
      preferredPlacement: 'bottom'
    },
    {
      id: 'metrics',
      targetSelector: '#tour-dashboard-metrics',
      targetTab: 'dashboard',
      icon: LayoutDashboard,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      titleKey: 'tour_dashboard_title',
      descKey: 'tour_dashboard_desc',
      badge: { en: 'Count-Up KPI Cards', ar: 'عدادات حيوية تفاعلية' },
      highlight: { 
        en: 'Instant health overview with smooth number animations', 
        ar: 'متابعة فورية لإجمالي المستندات والوثائق المنتهية بعدادات سلسة' 
      },
      preferredPlacement: 'bottom'
    },
    {
      id: 'expiring',
      targetSelector: '#tour-expiring-section',
      targetTab: 'dashboard',
      icon: Bell,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      titleKey: 'tour_reminders_title',
      descKey: 'tour_reminders_desc',
      badge: { en: 'Urgent Expiry Alerts', ar: 'تنبيهات الاستحقاق العاجلة' },
      highlight: { 
        en: 'Live days-remaining countdowns prevent late renewal fines', 
        ar: 'عداد تنازلي دقيق للأيام المتبقية يحميك من غرامات التأخير' 
      },
      preferredPlacement: 'top'
    },
    {
      id: 'counter',
      targetSelector: '#tour-counter-widget',
      targetTab: 'dashboard',
      icon: Sparkles,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      titleKey: 'tour_tracker_title',
      descKey: 'tour_tracker_desc',
      badge: { en: 'Daily Habit Tracker', ar: 'متتبع الإنجاز اليومي' },
      highlight: { 
        en: '+1 / +5 Quick buttons • Customizable goals • Streak saved locally', 
        ar: 'أزرار سريعة +1 و +5 • تحديد أهداف يومية • حفظ تلقائي للتقدم' 
      },
      preferredPlacement: 'top'
    },
    {
      id: 'nav-docs',
      targetSelector: '#tour-nav-documents',
      targetTab: 'dashboard',
      icon: FolderKanban,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      titleKey: 'tour_documents_title',
      descKey: 'tour_documents_desc',
      badge: { en: 'Categorized Archive', ar: 'الأرشيف المصنف' },
      highlight: { 
        en: 'Filter by category (Vehicle, Home, Personal) and OCR search', 
        ar: 'فلترة حسب الفئة والبحث العميق في نصوص المسح الضوئي' 
      },
      preferredPlacement: 'bottom'
    },
    {
      id: 'nav-reminders',
      targetSelector: '#tour-nav-reminders',
      targetTab: 'dashboard',
      icon: Bell,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      titleKey: 'tour_reminders_title',
      descKey: 'tour_reminders_desc',
      badge: { en: 'Proactive Timelines', ar: 'الجداول الزمنية' },
      highlight: { 
        en: 'Sorted by urgency: Overdue, <7 days, <30 days with renewal steps', 
        ar: 'مرتبة حسب الأولوية مع خطوات وإجراءات التجديد الرسمية' 
      },
      preferredPlacement: 'bottom'
    },
    {
      id: 'upload-btn',
      targetSelector: '#tour-upload-btn',
      targetTab: 'dashboard',
      icon: Camera,
      color: 'text-sand bg-sand/10 border-sand/30',
      titleKey: 'tour_upload_title',
      descKey: 'tour_upload_desc',
      badge: { en: 'OCR & Verification', ar: 'مسح ضوئي وتدقيق' },
      highlight: { 
        en: 'Camera scan • PDF drag & drop • Human-in-the-loop confirmation', 
        ar: 'تصوير بالكاميرا • سحب وإفلات • مراجعة وتأكيد دقيق للبيانات' 
      },
      preferredPlacement: 'bottom'
    }
  ];

  const currentStepData = tourSteps[currentStep] || tourSteps[0];
  const StepIcon = currentStepData.icon;
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  // Measure and update the spotlight target rectangle
  const updateTargetBounds = useCallback(() => {
    if (!isOnboardingOpen) return;

    const selector = currentStepData.targetSelector;
    let el = document.querySelector(selector) as HTMLElement | null;

    // Fallback for mobile upload or mobile nav if desktop selector isn't visible
    if (!el && selector === '#tour-upload-btn') {
      el = document.querySelector('button[aria-label="Scan Document"]') as HTMLElement | null;
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      const PADDING = 8;
      
      const newRect = {
        top: Math.max(0, rect.top - PADDING),
        left: Math.max(0, rect.left - PADDING),
        width: Math.min(window.innerWidth, rect.width + PADDING * 2),
        height: rect.height + PADDING * 2,
      };

      setTargetRect(newRect);

      // Decide placement (top vs bottom) based on viewport clearance
      const spaceBelow = window.innerHeight - (newRect.top + newRect.height);
      const spaceAbove = newRect.top;
      
      if (currentStepData.preferredPlacement === 'top') {
        setCardPlacement(spaceAbove > 260 ? 'top' : 'bottom');
      } else {
        setCardPlacement(spaceBelow > 260 ? 'bottom' : 'top');
      }

      // Smoothly scroll target into view if outside center
      const inView = rect.top >= 60 && rect.bottom <= window.innerHeight - 60;
      if (!inView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    } else {
      // If element not in DOM, fall back to center spotlight
      setTargetRect(null);
    }
  }, [isOnboardingOpen, currentStepData]);

  // Ensure appropriate tab is open if step requires it
  useEffect(() => {
    if (!isOnboardingOpen) return;

    if (currentStepData.targetTab && onNavigateTab) {
      onNavigateTab(currentStepData.targetTab);
    }

    // Trigger bounds check with small animation delay to allow scroll and tab switches
    setIsAnimating(true);
    const timer = setTimeout(() => {
      updateTargetBounds();
      setIsAnimating(false);
    }, 120);

    return () => clearTimeout(timer);
  }, [isOnboardingOpen, currentStep, currentStepData, onNavigateTab, updateTargetBounds]);

  // Recalculate on scroll and resize
  useEffect(() => {
    if (!isOnboardingOpen) return;

    const handleUpdate = () => {
      requestAnimationFrame(updateTargetBounds);
    };

    window.addEventListener('resize', handleUpdate, { passive: true });
    window.addEventListener('scroll', handleUpdate, { passive: true });

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [isOnboardingOpen, updateTargetBounds]);

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

  // Compute tooltip card position
  const CARD_WIDTH = Math.min(440, window.innerWidth - 32);
  let cardTop = 100;
  let cardLeft = (window.innerWidth - CARD_WIDTH) / 2;

  if (targetRect) {
    if (cardPlacement === 'bottom') {
      cardTop = Math.min(window.innerHeight - 300, targetRect.top + targetRect.height + 16);
    } else {
      cardTop = Math.max(16, targetRect.top - 280);
    }

    // Horizontally center with spotlight target, clamped within screen margins
    const targetCenterX = targetRect.left + (targetRect.width / 2);
    cardLeft = Math.max(16, Math.min(window.innerWidth - CARD_WIDTH - 16, targetCenterX - (CARD_WIDTH / 2)));
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none select-none">
      
      {/* 1. Animated Spotlight Cutout Box & Outer Dimming */}
      {targetRect ? (
        <div
          className="fixed pointer-events-none transition-all duration-500 ease-out"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`,
            boxShadow: '0 0 0 9999px rgba(3, 7, 18, 0.80)',
            borderRadius: '16px',
            border: '2px solid rgba(212, 163, 115, 0.95)',
          }}
        >
          {/* Animated beacon ring around targeted item */}
          <div className="absolute inset-0 -m-1 rounded-2xl border-2 border-sand/50 animate-ping opacity-40 pointer-events-none" />
          <div className="absolute inset-0 rounded-2xl shadow-[0_0_35px_rgba(212,163,115,0.45)] pointer-events-none" />

          {/* Animated Pointer Icon pointing at element */}
          <div 
            className={`absolute pointer-events-none flex items-center justify-center transition-all duration-300 ${
              cardPlacement === 'bottom'
                ? '-bottom-4 left-1/2 -translate-x-1/2 animate-bounce'
                : '-top-4 left-1/2 -translate-x-1/2 animate-bounce'
            }`}
          >
            <div className="w-8 h-8 rounded-full gradient-brand text-white flex items-center justify-center shadow-lg shadow-sand/40 border border-sand">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
        </div>
      ) : (
        /* Fallback Backdrop if target element is hidden/missing */
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto" />
      )}

      {/* 2. Floating Animated Tour Popover Card */}
      <div
        className="fixed pointer-events-auto transition-all duration-500 ease-out z-50"
        style={{
          top: `${cardTop}px`,
          left: `${cardLeft}px`,
          width: `${CARD_WIDTH}px`,
        }}
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-slate-900/98 backdrop-blur-xl border border-sand/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col">
          
          {/* Step Progress Line */}
          <div className="w-full bg-slate-800 h-1 relative">
            <div 
              className="bg-gradient-to-r from-sand via-amber-400 to-brand-400 h-1 transition-all duration-400 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>

          {/* Top Bar with Step counter and Skip */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#07151D]/90">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sand animate-ping" />
              <span className="text-[11px] font-bold text-sand uppercase tracking-wider">
                {t('tour_step_indicator', { current: currentStep + 1, total: totalSteps })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={skipTour}
                className="text-xs font-medium text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded-lg hover:bg-slate-800 transition-colors"
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

          {/* Card Body */}
          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Header with animated icon and title */}
            <div className="flex items-start gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 shadow-md ${currentStepData.color}`}>
                <StepIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white leading-snug truncate">
                    {t(currentStepData.titleKey)}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {t(currentStepData.descKey)}
                </p>
              </div>
            </div>

            {/* Target Highlight Pill */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-sand uppercase tracking-wider px-2 py-0.5 rounded-full bg-sand/10 border border-sand/25 shrink-0">
                {currentStepData.badge[language]}
              </span>
              <span className="text-[11px] text-slate-300 truncate">
                {currentStepData.highlight[language]}
              </span>
            </div>

            {/* Clickable Step Indicator Dots */}
            <div className="pt-1 flex items-center justify-center gap-1.5">
              {tourSteps.map((s, idx) => {
                const isCurrent = idx === currentStep;
                const isPassed = idx < currentStep;
                return (
                  <button
                    key={s.id}
                    onClick={() => goToStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
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
          <div className="px-4 py-3 border-t border-slate-800 bg-[#07151D]/90 flex items-center justify-between gap-2">
            <div>
              {!isFirst ? (
                <button
                  onClick={prevStep}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
                  <span>{t('tour_back')}</span>
                </button>
              ) : (
                <button
                  onClick={skipTour}
                  className="text-xs font-medium text-slate-400 hover:text-white transition-colors px-2 py-1"
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
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    title="Replay from step 1"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-sand" />
                    <span>{t('tour_replay')}</span>
                  </button>
                  <button
                    onClick={finishTour}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-sand text-slate-950 hover:bg-sand/90 transition-transform active:scale-95 shadow-md shadow-sand/20"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('tour_finish')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-sand text-slate-950 hover:bg-sand/90 transition-transform active:scale-95 shadow-md shadow-sand/20"
                >
                  <span>{t('tour_next')}</span>
                  <ArrowRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
