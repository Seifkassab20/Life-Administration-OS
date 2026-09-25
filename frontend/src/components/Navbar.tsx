import React, { useState } from 'react';
import { 
  FileText, LayoutDashboard, FolderKanban, Bell, Bot, Upload, 
  Languages, LogOut, User, Menu, X, Shield 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenUpload: () => void;
  onOpenAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onOpenUpload,
  onOpenAssistant,
}) => {
  const { language, setLanguage, t, isRtl } = useLanguage();
  const { user, isAuthenticated, logout, loginAsDemo } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const navItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'documents', label: t('documents'), icon: FolderKanban },
    { id: 'reminders', label: t('reminders'), icon: Bell },
    { id: 'assistant', label: t('assistant'), icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
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
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-brand-500/15 text-brand-400 border border-brand-500/25 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
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
                    onClick={logout}
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
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  {t('login')}
                </button>
                <button
                  onClick={loginAsDemo}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium gradient-brand text-white shadow-md shadow-brand-500/20 hover:opacity-90 transition-opacity"
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
                {item.label}
              </button>
            );
          })}
          <div className="pt-2">
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
