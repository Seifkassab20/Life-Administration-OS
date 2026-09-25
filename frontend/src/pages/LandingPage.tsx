import React from 'react';
import { 
  Shield, Sparkles, ArrowRight, FileCheck, Clock, Lock, 
  Search, CheckCircle2, Car, User, Home, Briefcase, 
  GraduationCap, Receipt, ChevronRight, Eye 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
}) => {
  const { t } = useLanguage();
  const { loginAsDemo } = useAuth();

  const supportedDocs = [
    { title: t('type_national_id'), desc: '14-digit ID, DOB, Governorate, Expiry', icon: User, cat: 'Personal' },
    { title: t('type_vehicle_license'), desc: 'Plates, Chassis, Motor, Expiry', icon: Car, cat: 'Vehicle' },
    { title: t('type_vehicle_insurance'), desc: 'Policy Number, Insurer, Term, Amount', icon: Shield, cat: 'Vehicle' },
    { title: t('type_rental_contract'), desc: 'Landlord, Tenant, Rent, Period', icon: Home, cat: 'Home' },
    { title: t('type_utility_bill'), desc: 'Provider, Account No, Due Date, Total', icon: Receipt, cat: 'Home' },
    { title: t('type_certificate'), desc: 'Degree, University, Distinction, Date', icon: GraduationCap, cat: 'Education' },
    { title: t('type_work_contract'), desc: 'Employer, Role, Salary, Renewal', icon: Briefcase, cat: 'Work' },
  ];

  const steps = [
    {
      num: '01',
      title: 'Upload Any Document',
      desc: 'Drag and drop your PDF or image. Support for Arabic and English mixed documents.'
    },
    {
      num: '02',
      title: 'AI Reads & Extracts',
      desc: 'Automated OCR, type classification, and structured key-value field extraction.'
    },
    {
      num: '03',
      title: 'Detect Dates & Remind',
      desc: 'Important expirations and due dates generate 30-day, 7-day, and 1-day reminders automatically.'
    },
    {
      num: '04',
      title: 'Ask Questions Anytime',
      desc: 'Ask questions grounded strictly in your documents with verified source citations.'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] gradient-glow pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Designed for Egypt • Bilingual Arabic & English</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.15] mb-6">
          {t('heroTitle')}
        </h1>

        {/* Hero Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          {t('heroSubtitle')}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-white gradient-brand shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>{t('signup')}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>

          <button
            onClick={() => {
              loginAsDemo();
              onExploreDemo();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-medium text-slate-200 hover:text-white glass-panel glass-panel-hover border border-slate-700/80 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-brand-400" />
            <span>{t('seeHowItWorks')}</span>
          </button>
        </div>

        {/* Visual Preview Teaser */}
        <div className="max-w-5xl mx-auto glass-panel p-3 rounded-3xl border border-white/10 shadow-2xl">
          <div className="bg-slate-900/90 rounded-2xl p-6 sm:p-8 border border-slate-800 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider text-brand-400">Personal Life Operating System</span>
                <h3 className="text-xl font-bold text-white mt-1">Seif's Life Administration Dashboard</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  7 Protected Documents
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  2 Expiring Soon
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                  <Car className="w-4 h-4 text-brand-400" />
                  <span>Vehicle License (Toyota Corolla)</span>
                </div>
                <p className="text-sm font-bold text-amber-400">Expires in 12 days</p>
                <p className="text-xs text-slate-400 mt-1">Plates: س ي ف 1234 • Cairo Traffic</p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>Electricity Bill (South Cairo)</span>
                </div>
                <p className="text-sm font-bold text-amber-400">Due in 5 days (420.50 EGP)</p>
                <p className="text-xs text-slate-400 mt-1">Acc: EG-ELEC-409128</p>
              </div>

              <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span>Motor Insurance Policy</span>
                </div>
                <p className="text-sm font-bold text-slate-200">Expires in 31 days</p>
                <p className="text-xs text-slate-400 mt-1">Misr Insurance • Comprehensive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-brand-400">Simple & Automated</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            How Life Administration OS Works
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Never lose an expiration date, miss a contract deadline, or dig through physical drawers again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((st, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl border border-slate-800/80 hover:border-brand-500/30 transition-all">
              <span className="text-2xl font-black text-brand-400/40 block mb-3 font-mono">{st.num}</span>
              <h3 className="text-base font-bold text-white mb-2">{st.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported Documents Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase font-bold tracking-wider text-brand-400">Comprehensive MVP Coverage</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2">
            The 7 Core Life Documents
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3">
            Custom-tailored field extraction and date intelligence for the documents you rely on every day.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {supportedDocs.map((doc, idx) => {
            const Icon = doc.icon;
            return (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-brand-500/40 transition-all">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-brand-400 mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{doc.cat}</span>
                <h4 className="text-sm font-bold text-white mt-0.5 mb-1.5">{doc.title}</h4>
                <p className="text-xs text-slate-400">{doc.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Privacy-First Architecture</h3>
              <p className="text-xs text-slate-400">Your documents belong to you and only you.</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-300 pt-4 border-t border-slate-800">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Tenant Isolation:</strong> Every document query requires verified JWT authentication; cross-tenant document access is strictly impossible.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Secure Signed Storage:</strong> Files are never stored directly in database blobs, but in secure private storage with short-lived access links.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Grounded AI (Zero Hallucination):</strong> Answers are produced exclusively from verified document excerpts, preventing model guessing.</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Total Deletion Rights:</strong> Deleting a document immediately purges files, extracted text, embeddings, and reminders forever.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-white mb-4">
          Ready to put your documents to work?
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-8">
          Upload once. Life Administration OS remembers what matters so you can focus on living.
        </p>
        <button
          onClick={onGetStarted}
          className="px-8 py-3.5 rounded-2xl text-sm font-semibold text-white gradient-brand shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-105 active:scale-95 transition-all"
        >
          {t('signup')}
        </button>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© 2026 Life Administration OS. Built with precision for privacy-conscious individuals in Egypt and beyond.</p>
      </footer>
    </div>
  );
};
