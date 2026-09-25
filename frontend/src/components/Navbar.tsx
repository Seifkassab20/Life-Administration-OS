import React, { useState } from 'react';
import { 
  FileText, LayoutDashboard, FolderKanban, Bell, Bot, Upload, 
  Languages, LogOut, User, Menu, X, Shield, Compass, HelpCircle 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOnboarding } from '../context/OnboardingContext';
import { AnimatedCounter } from './AnimatedCounter';
import { HelpIcon } from './HelpIcon';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenAssistant: () => void;
  documentsCount?: number;
  remindersCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenUpload,
  onOpenAssistant,
  documentsCount = 7,
  remindersCount = 2,
}) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const { startTour, openTabGuide } = useOnboarding();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { 
      id: 'documents', 
      label: t('documents'), 
      icon: FolderKanban, 
      badge: documentsCount,
      badgeColor: 'bg-brand-500/20 text-brand-300 border-brand-500/30'
    },
    { 
      id: 'reminders', 
      label: t('reminders'), 
      icon: Bell, 
      badge: remindersCount,
      badgeColor: 'bg-sand/20 text-sand border-sand/30'
    },
    { id: 'assistant', label: t('assistant'), icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            id="tour-brand"
            onClick={() => onNavigate(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Life Administration <span className="text-brand-400 font-extrabold">OS</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">
                {t('appTagline')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.id;
                return (
                  <div key={item.id} className="flex items-center group">
                    <button
                      id={`tour-nav-${item.id}`}
                      onClick={() => onNavigate(item.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        active
                          ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono border leading-none ${
                          item.badgeColor || 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                        }`}>
                          <AnimatedCounter value={item.badge} duration={600} />
                        </span>
                      )}
                    </button>
                    {/* Inline Tab Help Icon */}
                    <HelpIcon
                      tabId={item.id}
                      size="sm"
                      className="opacity-40 group-hover:opacity-100 transition-opacity -ml-1 mr-1"
                    />
                  </div>
                );
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Interactive Tour & Replay Button */}
            {isAuthenticated && (
              <button
                id="tour-replay-btn"
                onClick={() => startTour(0)}
                title="Interactive App Tour (Click to replay anytime)"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-sand bg-sand/10 hover:bg-sand/20 border border-sand/30 hover:border-sand/50 transition-all shadow-sm active:scale-95 group"
              >
                <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform text-sand" />
                <span className="hidden sm:inline">{t('tour_start')}</span>
              </button>
            )}

            {/* Quick Tab Purpose Guide Trigger */}
            {isAuthenticated && (
              <button
                id="tour-tab-guide-btn"
                onClick={() => openTabGuide(currentTab)}
                title={t('tab_guide_title')}
                className="p-1.5 text-slate-400 hover:text-sand hover:bg-sand/10 rounded-lg transition-colors"
                aria-label="Tab Guide"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}

            {/* Language Switcher */}
            <button
              id="tour-language-btn"
              onClick={toggleLanguage}
              title="Toggle English / العربية"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-brand-400" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {isAuthenticated ? (
              <>
                {/* Upload Action */}
                <button
                  id="tour-upload-btn"
                  onClick={onOpenUpload}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-brand hover:opacity-95 shadow-md shadow-brand-500/25 hover:shadow-brand-500/40 transition-all active:scale-95"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('uploadDoc')}</span>
                </button>

                {/* User Info / Logout */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400">
                    {user?.full_name?.charAt(0) || 'S'}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      onNavigate('landing');
                    }}
                    title={t('logout')}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('login')}
                  className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => {
                    loginAsDemo();
                    onNavigate('dashboard');
                  }}
                  className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-brand-300 border border-slate-800 transition-colors"
                >
                  Demo Mode
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium gradient-brand text-white shadow-md shadow-brand-500/20 hover:opacity-90 transition-opacity"
                >
                  {t('signup')}
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  active ? 'bg-brand-500/20 text-brand-400' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left rtl:text-right">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border leading-none ${
                    item.badgeColor || 'bg-brand-500/20 text-brand-300 border-brand-500/30'
                  }`}>
                    <AnimatedCounter value={item.badge} duration={600} />
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 space-y-1.5 border-t border-slate-800/80 mt-2">
            <button
              onClick={() => {
                startTour(0);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-sand bg-sand/10 border border-sand/30"
            >
              <Compass className="w-4 h-4 text-sand" />
              <span>{t('tour_start')} (Replay Tour)</span>
            </button>
            <button
              onClick={() => {
                openTabGuide(currentTab);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60"
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('tab_guide_title')}</span>
            </button>
            <button
              onClick={() => {
                onOpenUpload();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white gradient-brand"
            >
              <Upload className="w-4 h-4" />
              {t('uploadDoc')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
