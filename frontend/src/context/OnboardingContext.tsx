import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface TabGuideInfo {
  id: string;
  name: { en: string; ar: string };
  badge: { en: string; ar: string };
  meaning: { en: string; ar: string };
  purpose: { en: string; ar: string };
  whenToTap: { en: string; ar: string };
  actions: { en: string[]; ar: string[] };
  aiSuperpower: { en: string; ar: string };
  iconName: string;
}

export const TAB_GUIDE_ITEMS: Record<string, TabGuideInfo> = {
  dashboard: {
    id: 'dashboard',
    name: { en: 'Dashboard', ar: 'لوحة التحكم' },
    badge: { en: 'Central Cockpit', ar: 'لوحة القيادة المركزية' },
    meaning: {
      en: 'The executive health overview of your personal and administrative life paperwork.',
      ar: 'نظرة تنفيذية شاملة ومباشرة لحالة جميع وثائقك وأوراقك الحيوية.'
    },
    purpose: {
      en: 'To give you immediate visibility into critical deadlines, document counts, urgency alerts, and daily habit tracking without searching.',
      ar: 'منحك رؤية فورية وشاملة للمواعيد النهائية الحرجة، وأعداد المستندات، والتنبيهات العاجلة، ومتابعة المهام اليومية.'
    },
    whenToTap: {
      en: 'Tap whenever you open the app to see your urgent renewals, check expiring paperwork, or track your daily document review progress.',
      ar: 'اضغط عليها عند فتح التطبيق لمعرفة الوثائق التي قاربت على الانتهاء، أو متابعة إنجاز مهامك اليومية.'
    },
    actions: {
      en: [
        'Monitor count-up KPI metrics for total and expiring documents',
        'Review cards with live days-remaining countdowns',
        'Launch instant AI queries directly from the prompt bar',
        'Log reviewed paperwork and audit goals in the interactive counter'
      ],
      ar: [
        'متابعة إحصائيات العدادات التفاعلية لإجمالي المستندات والوثائق المنتهية',
        'مراجعة بطاقات المستندات العاجلة مع عداد تنازلي للأيام المتبقية',
        'طرح استفسارات ذكية فورية عبر شريط البحث التوليدي',
        'تسجيل الوثائق المراجعة في متتبع الأهداف اليومي'
      ]
    },
    aiSuperpower: {
      en: 'Real-time proactive timeline engine that calculates exact days remaining and flags at-risk paperwork before penalties happen.',
      ar: 'محرك زمني ذكي يحسب الأيام المتبقية بدقة وينبهك قبل استحقاق أي غرامات تأخير أو انتهاء.'
    },
    iconName: 'LayoutDashboard'
  },
  documents: {
    id: 'documents',
    name: { en: 'Documents Library', ar: 'مكتبة المستندات' },
    badge: { en: 'Encrypted Vault', ar: 'خزينة مشفرة' },
    meaning: {
      en: 'Your complete digital filing cabinet organized by smart categories and verified metadata.',
      ar: 'أرشيفك الرقمي المنظم تلقائياً حسب الفئات والبيانات المعتمدة.'
    },
    purpose: {
      en: 'To securely store, search, inspect, and organize all your physical and digital documents in one central accessible place.',
      ar: 'تخزين وفهرسة والبحث في جميع أوراقك الرسمية والشخصية في مكان آمن يسهل الوصول إليه.'
    },
    whenToTap: {
      en: 'Tap when you need to find an ID, check contract terms, search inside scanned paperwork, or filter files by category or status.',
      ar: 'اضغط هنا للبحث عن وثيقة معينة، أو التحقق من شروط عقد، أو فلترة المستندات حسب النوع أو حالة الصلاحية.'
    },
    actions: {
      en: [
        'Browse by category: Personal, Vehicle, Home, Work, Education, Finance',
        'Filter by status: Safe, Attention Soon, Expired, Needs Review',
        'Search full OCR text across both Arabic and English scans',
        'Inspect original files alongside verified fields and confidence scores'
      ],
      ar: [
        'تصفح المستندات حسب الفئة: شخصي، مركبات، منزل، عمل، تعليم، مالية',
        'فلترة سريعة حسب الحالة: سارٍ، يتطلب انتباهاً، منتهٍ، بانتظار المراجعة',
        'بحث شامل في نصوص المستندات الممسوحة بالعربية والإنجليزية',
        'استعراض الملف الأصلي إلى جانب الحقول المستخرجة ومستوى دقة الذكاء الاصطناعي'
      ]
    },
    aiSuperpower: {
      en: 'Multi-modal vision OCR and bilingual extraction that reads Arabic & English documents and extracts structured key-value pairs.',
      ar: 'تقنية بصرية متقدمة تقرأ النصوص العربية والإنجليزية وتستخرج البيانات الأساسية تلقائياً.'
    },
    iconName: 'FolderKanban'
  },
  reminders: {
    id: 'reminders',
    name: { en: 'Reminders & Deadlines', ar: 'التنبيهات والمواعيد' },
    badge: { en: 'Proactive Shield', ar: 'حماية استباقية' },
    meaning: {
      en: 'An intelligent calendar and deadline safeguard for all time-sensitive paperwork.',
      ar: 'جدول زمني استباقي ينبهك بمواعيد التجديد والاستحقاق قبل فوات الأوان.'
    },
    purpose: {
      en: 'To prevent unexpected expired vehicle licenses, insurance lapses, national ID expirations, and late payment utility fines.',
      ar: 'حمايتك من غرامات انتهاء الرخص، أو انقطاع التأمين، أو تأخر سداد الفواتير الحكومية والخدمية.'
    },
    whenToTap: {
      en: 'Tap to review upcoming renewal schedules, see what is due in 7 or 30 days, and read renewal instructions or official portal links.',
      ar: 'اضغط هنا للاطلاع على المواعيد القادمة خلال أسبوع أو شهر، ومعرفة متطلبات التجديد والروابط الرسمية.'
    },
    actions: {
      en: [
        'View urgency tiers: Overdue, Expiring in <7 days, Expiring in <30 days, Safe',
        'Track renewal lead times for vehicle inspections and civil registry',
        'Directly access documents that require immediate renewal action'
      ],
      ar: [
        'عرض مستويات الأولوية: متأخر، ينتهي خلال 7 أيام، ينتهي خلال شهر، آمن',
        'معرفة الفترات الموصى بها لبدء إجراءات تجديد التراخيص والفحص',
        'الانتقال المباشر للمستند المطلوب اتخاذ إجراء بشأنه'
      ]
    },
    aiSuperpower: {
      en: 'Automated deadline calculation tailored to specific document types and governmental renewal regulations.',
      ar: 'احتساب تلقائي لمدد التجديد المطلوبة وفق اللوائح المنظمة لكل نوع مستند.'
    },
    iconName: 'Bell'
  },
  assistant: {
    id: 'assistant',
    name: { en: 'Grounded AI Assistant', ar: 'المساعد الذكي الموثق' },
    badge: { en: 'Document Intelligence', ar: 'ذكاء المستندات' },
    meaning: {
      en: 'A dedicated conversational assistant that reads, understands, and answers questions strictly from your documents.',
      ar: 'مساعد ذكي خاص يجيب عن تساؤلاتك بالاستناد الحصري والكامل لوثائقك المرفوعة.'
    },
    purpose: {
      en: 'To eliminate the need to manually read multi-page contracts, utility bills, or policies by answering your questions directly with citations.',
      ar: 'توفير وقتك وجهدك في قراءة العقود والوثائق الطويلة، والإجابة عن استفساراتك فوراً مع ذكر المصدر الدقيق.'
    },
    whenToTap: {
      en: 'Tap when you have any question about your paperwork (e.g., "What is my car chassis number?", "When does my apartment lease end?", "What was last month\'s electricity cost?").',
      ar: 'اضغط هنا عند الحاجة لمعرفة أي معلومة في أوراقك (مثل: "ما هو رقم شاسيه السيارة؟"، "متى ينتهي عقد الإيجار؟"، "كم بلغت فاتورة الكهرباء؟").'
    },
    actions: {
      en: [
        'Ask questions in natural English or Egyptian Arabic',
        'View highlighted source citations pointing to exact document lines',
        'Extract specific numbers, policy IDs, and payment totals instantly'
      ],
      ar: [
        'طرح الأسئلة بلغة طبيعية بالعربية أو الإنجليزية',
        'استعراض المصادر والاقتباسات المباشرة من نصوص الوثائق',
        'استخراج أرقام الوثائق، وبيانات التأمين، ومبالغ الفواتير بضغطة زر'
      ]
    },
    aiSuperpower: {
      en: 'Strict Grounded Retrieval-Augmented Generation (RAG) powered by Gemini that never hallucinates facts.',
      ar: 'نظام توليدي موثق بنموذج Gemini يعتمد كلياً على وثائقك ولا يختلق أي معلومات غير موجودة.'
    },
    iconName: 'Bot'
  },
  upload: {
    id: 'upload',
    name: { en: 'Scan & Upload Pipeline', ar: 'المسح والرفع الذكي' },
    badge: { en: 'OCR & Verification', ar: 'استخراج وتدقيق' },
    meaning: {
      en: 'High-speed ingestion pipeline for physical paper scans and digital PDF files.',
      ar: 'مسار معالجة فوري لمسح الأوراق بالكاميرا ورفع ملفات PDF الرقمية.'
    },
    purpose: {
      en: 'To transform raw paper documents and photos into verified, searchable, and date-tracked digital records in seconds.',
      ar: 'تحويل الأوراق العادية والصور إلى سجلات رقمية موثقة ومفهرسة وقابلة للبحث والمتابعة.'
    },
    whenToTap: {
      en: 'Tap the prominent Scan button on mobile or Upload on desktop whenever you receive a new bill, card, or contract.',
      ar: 'اضغط على زر الكاميرا/المسح في الهاتف أو رفع مستند على الحاسوب فور استلام أي ورقة أو فاتورة جديدة.'
    },
    actions: {
      en: [
        'Capture photos with direct mobile camera integration',
        'Drag and drop PDFs or images up to 25MB',
        'Watch real-time 5-stage processing (OCR -> Classification -> Extraction)',
        'Confirm or edit extracted fields with human-in-the-loop verification'
      ],
      ar: [
        'التقاط صور فورية مباشرة عبر كاميرا الهاتف المحمول',
        'سحب وإفلات ملفات PDF والصور حتى 25 ميجابايت',
        'متابعة خطوات المعالجة الخمسة الحية (قراءة -> تصنيف -> استخراج)',
        'تأكيد أو تعديل البيانات المستخرجة عبر واجهة التدقيق البشري'
      ]
    },
    aiSuperpower: {
      en: 'Human-in-the-loop architecture ensuring 100% data fidelity before anything is committed to your permanent archive.',
      ar: 'نموذج التحقق البشري لضمان دقة البيانات بنسبة 100% قبل اعتمادها وحفظها.'
    },
    iconName: 'Camera'
  },
  counter: {
    id: 'counter',
    name: { en: 'Activity & Goal Tracker', ar: 'متتبع الإنجاز اليومي' },
    badge: { en: 'Productivity Widget', ar: 'إنتاجية ومتابعة' },
    meaning: {
      en: 'An interactive daily counter widget to keep track of administrative progress and audits.',
      ar: 'أداة تفاعلية لحساب المهام الإدارية ومراجعة الوثائق المنجزة يومياً.'
    },
    purpose: {
      en: 'To motivate and maintain personal accountability in managing paperwork, paying bills, and resolving renewals.',
      ar: 'تحفيزك على إنجاز الأعباء الإدارية والورقية بانتظام ومتابعة التزامك بأهدافك.'
    },
    whenToTap: {
      en: 'Tap +1 or +5 whenever you finish reviewing a document, pay a bill, or achieve your daily administrative goal.',
      ar: 'اضغط على +1 أو +5 عند الانتهاء من مراجعة أي مستند أو سداد فاتورة لتحقيق هدفك اليومي.'
    },
    actions: {
      en: [
        'Increment by +1 or +5, decrement by -1 or -5',
        'Set custom targets (presets for 5, 10, 25)',
        'Rename tracker label to fit your current goal',
        'Automatic persistent progress saved in local storage'
      ],
      ar: [
        'زيادة العداد بـ +1 أو +5 وإنقاصه بـ -1 أو -5',
        'تحديد هدف يومي مخصص (خيارات سريعة 5، 10، 25)',
        'إمكانية تغيير اسم العداد ليتناسب مع هدفك الحالي',
        'حفظ تلقائي للتقدم في المتصفح دون فقدان للبيانات'
      ]
    },
    aiSuperpower: {
      en: 'Dynamic visual progress ring and completion percentage with celebratory feedback upon target reach.',
      ar: 'مؤشر إنجاز تفاعلي بنسبة مئوية واحتفاء بصري عند إتمام الهدف المحدد.'
    },
    iconName: 'Sparkles'
  }
};

interface OnboardingContextType {
  isOnboardingOpen: boolean;
  currentStep: number;
  totalSteps: number;
  isTabGuideOpen: boolean;
  selectedGuideTabId: string | null;
  startTour: (initialStep?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (stepIndex: number) => void;
  skipTour: () => void;
  finishTour: () => void;
  replayTour: () => void;
  openTabGuide: (tabId?: string) => void;
  closeTabGuide: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STORAGE_KEY = 'laos_onboarding_completed_v1';

export const OnboardingProvider: React.FC<{ children: React.ReactNode; onNavigateTab?: (tab: string) => void }> = ({
  children,
  onNavigateTab
}) => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 8;
  const [isTabGuideOpen, setIsTabGuideOpen] = useState(false);
  const [selectedGuideTabId, setSelectedGuideTabId] = useState<string | null>(null);

  // Check if first-time user
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    // Don't auto open immediately on load to prevent jarring, but allow gentle prompt or auto-show on landing demo
    if (!completed) {
      const timer = setTimeout(() => {
        // Auto open for first time visitors
        setIsOnboardingOpen(true);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const startTour = useCallback((initialStep = 0) => {
    setCurrentStep(initialStep);
    setIsOnboardingOpen(true);
    setIsTabGuideOpen(false);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = prev + 1;
      if (next >= totalSteps) {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
        setIsOnboardingOpen(false);
        return 0;
      }
      return next;
    });
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < totalSteps) {
      setCurrentStep(stepIndex);
    }
  }, [totalSteps]);

  const skipTour = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOnboardingOpen(false);
  }, []);

  const finishTour = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOnboardingOpen(false);
    setCurrentStep(0);
  }, []);

  const replayTour = useCallback(() => {
    setCurrentStep(0);
    setIsOnboardingOpen(true);
  }, []);

  const openTabGuide = useCallback((tabId?: string) => {
    setSelectedGuideTabId(tabId || 'dashboard');
    setIsTabGuideOpen(true);
  }, []);

  const closeTabGuide = useCallback(() => {
    setIsTabGuideOpen(false);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        isOnboardingOpen,
        currentStep,
        totalSteps,
        isTabGuideOpen,
        selectedGuideTabId,
        startTour,
        nextStep,
        prevStep,
        goToStep,
        skipTour,
        finishTour,
        replayTour,
        openTabGuide,
        closeTabGuide
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
