import React from 'react';
import { 
  LayoutDashboard, FolderKanban, Bell, Bot, Camera, Plus 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MobileTabBarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenScan: () => void;
  urgentCount?: number;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentTab,
  onNavigate,
  onOpenScan,
  urgentCount = 0,
}) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'documents', label: t('documents'), icon: FolderKanban },
    { id: 'reminders', label: t('reminders'), icon: Bell, badge: urgentCount },
    { id: 'assistant', label: t('assistant'), icon: Bot },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07151D]/90 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around relative">
        
        {/* First 2 tabs */}
        {tabs.slice(0, 2).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors ${
                isActive ? 'text-sand font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-sand scale-105' : 'text-slate-400'}`} />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

        {/* Center Prominent Scan / Camera Button */}
        <div className="flex flex-col items-center justify-center px-1 -mt-6">
          <button
            onClick={onOpenScan}
            aria-label="Scan Document"
            className="w-13 h-13 rounded-full gradient-brand text-white shadow-xl shadow-sand/30 flex items-center justify-center border-4 border-[#07151D] active:scale-95 transition-transform"
          >
            <Camera className="w-6 h-6" />
          </button>
          <span className="text-[9px] text-sand font-semibold mt-0.5 uppercase tracking-wider">
            Scan
          </span>
        </div>

        {/* Last 2 tabs */}
        {tabs.slice(2, 4).map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors relative ${
                isActive ? 'text-sand font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-sand scale-105' : 'text-slate-400'}`} />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}

      </div>
    </div>
  );
};
