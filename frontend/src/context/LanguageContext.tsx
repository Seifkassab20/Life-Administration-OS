import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ar';

interface Translations {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: Translations = {
  // Navigation
  appName: { en: 'Life Administration OS', ar: 'نظام إدارة الحياة' },
  appTagline: { en: 'Intelligent Document System', ar: 'نظام المستندات الذكي' },
  dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
  documents: { en: 'Documents', ar: 'المستندات' },
  reminders: { en: 'Reminders', ar: 'التنبيهات' },
  assistant: { en: 'AI Assistant', ar: 'المساعد الذكي' },
  uploadDoc: { en: 'Upload Document', ar: 'رفع مستند' },
  logout: { en: 'Logout', ar: 'تسجيل الخروج' },
  login: { en: 'Sign In', ar: 'تسجيل الدخول' },
  signup: { en: 'Get Started', ar: 'ابدأ الآن' },

  // Landing Page
  heroTitle: {
    en: "Your documents shouldn't just be stored. They should understand you.",
    ar: "مستنداتك لا يجب أن تُخزن فقط. بل يجب أن تفهمك وتتحدث معك."
  },
  heroSubtitle: {
    en: "Life Administration OS uses AI to organize your important documents, extract what matters, track important dates, and help you find answers instantly.",
    ar: "نظام إدارة الحياة الذكي ينظم وثائقك الشخصية، ويستخرج البيانات الجوهرية، ويتابع مواعيد التجديد والانتهاء، ويجيب على تساؤلاتك فورياً."
  },
  seeHowItWorks: { en: 'See How It Works', ar: 'شاهد كيف يعمل' },
  privacyNotice: {
    en: 'Private & Secure by Design. Documents are isolated per user with zero cross-tenant access.',
    ar: 'خصوصية وأمان فائق. وثائقك معزولة ومحمية بالكامل ولا يطلع عليها سواك.'
  },

  // Document Categories
  cat_all: { en: 'All Documents', ar: 'جميع المستندات' },
  cat_personal: { en: 'Personal', ar: 'شخصي' },
  cat_vehicle: { en: 'Vehicle', ar: 'المركبات' },
  cat_home: { en: 'Home & Housing', ar: 'المنزل والعقارات' },
  cat_work: { en: 'Work & Career', ar: 'العمل والوظيفة' },
  cat_education: { en: 'Education', ar: 'التعليم' },
  cat_finance: { en: 'Finance', ar: 'المالية' },
  cat_other: { en: 'Other', ar: 'أخرى' },

  // Document Types
  type_national_id: { en: 'National ID', ar: 'بطاقة الرقم القومي' },
  type_vehicle_license: { en: 'Vehicle License', ar: 'رخصة تسيير مركبة' },
  type_vehicle_insurance: { en: 'Vehicle Insurance', ar: 'وثيقة تأمين مركبة' },
  type_rental_contract: { en: 'Rental Contract', ar: 'عقد إيجار' },
  type_utility_bill: { en: 'Utility Bill', ar: 'فاتورة مرافق (كهرباء/مياه/غاز)' },
  type_certificate: { en: 'Certificate', ar: 'شهادة تخرج / إتمام' },
  type_work_contract: { en: 'Work Contract', ar: 'عقد عمل' },
  type_other: { en: 'Other Document', ar: 'مستند عام' },

  // Statuses
  status_safe: { en: 'Safe', ar: 'آمن وسارٍ' },
  status_attention_soon: { en: 'Attention Soon', ar: 'يتطلب انتباهك قريباً' },
  status_expired: { en: 'Expired', ar: 'منتهي الصلاحية' },
  status_processing: { en: 'Processing', ar: 'قيد المعالجة' },
  status_needs_review: { en: 'Needs Review', ar: 'يتطلب المراجعة' },

  // Dashboard Stats
  totalDocs: { en: 'Total Documents', ar: 'إجمالي المستندات' },
  expiringSoon: { en: 'Expiring Soon', ar: 'تنتهي قريباً' },
  needsAttention: { en: 'Requires Attention', ar: 'تتطلب الانتباه' },
  recentlyAdded: { en: 'Recently Added', ar: 'أضيفت مؤخراً' },
  askAnythingPlaceholder: {
    en: 'Ask your documents anything... (e.g. When does my car license expire?)',
    ar: 'اسأل مستنداتك أي شيء... (مثال: متى تنتهي رخصة سيارتي؟)'
  },
  expiresInDays: { en: 'Expires in {days} days', ar: 'ينتهي خلال {days} يوم' },
  dueInDays: { en: 'Due in {days} days', ar: 'يستحق خلال {days} أيام' },

  // Upload Experience
  dragDropTitle: { en: 'Drag and drop your document here', ar: 'اسحب وأفلت مستندك هنا' },
  dragDropSubtitle: { en: 'Supports PDF, JPG, PNG up to 25MB', ar: 'يدعم ملفات PDF و JPG و PNG حتى 25 ميجابايت' },
  browseFiles: { en: 'Browse Files', ar: 'استعراض الملفات' },
  step_uploading: { en: 'Uploading document...', ar: 'جارٍ رفع الملف...' },
  step_reading: { en: 'Reading document with OCR...', ar: 'قراءة النصوص بتقنية OCR...' },
  step_understanding: { en: 'Classifying document type...', ar: 'التعرف على نوع المستند...' },
  step_extracting: { en: 'Extracting key fields & dates...', ar: 'استخراج البيانات والتواريخ...' },
  step_complete: { en: 'Processing complete!', ar: 'اكتملت المعالجة بنجاح!' },

  // Human Verification
  reviewHeading: { en: 'We found this information', ar: 'البيانات المستخرجة آلياً' },
  reviewSubheading: { en: 'Verify and adjust the AI-extracted details below.', ar: 'يرجى مراجعة وتأكيد البيانات المستخرجة من المستند.' },
  confirmBtn: { en: 'Confirm Information', ar: 'تأكيد وحفظ البيانات' },
  editBtn: { en: 'Edit', ar: 'تعديل' },
  cancelBtn: { en: 'Cancel', ar: 'إلغاء' },

  // Grounded Assistant
  assistantTitle: { en: 'Grounded Document Intelligence', ar: 'المساعد الذكي المستند لوثائقك' },
  assistantPrompt: {
    en: 'Every answer is strictly verified and cited from your documents.',
    ar: 'كل إجابة مستندة وموثقة بدقة ومستخرجة من وثائقك المرفوعة.'
  },
  sourceLabel: { en: 'Source', ar: 'المصدر' },
  askDocAction: { en: 'Ask about this document', ar: 'اسأل عن هذا المستند' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('laos_lang') as Language) || 'en';
  });

  const isRtl = language === 'ar';

  useEffect(() => {
    localStorage.setItem('laos_lang', language);
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRtl]);

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const item = translations[key];
    let text = item ? item[language] : key;

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
