import React from 'react';
import { Menu, Bell, Sparkles, ShieldCheck } from 'lucide-react';
import { TabType } from '../types';
import { LanguageType, TRANSLATIONS, LANGUAGES } from '../lib/translations';
import { triggerHaptic } from '../lib/haptics';

interface TopAppBarProps {
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenBrochure: () => void;
  unreadCount?: number;
  currentTab: TabType;
  onNavigate: (tab: TabType) => void;
  currentLang?: LanguageType;
  onLangChange?: (lang: LanguageType) => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  onOpenDrawer,
  onOpenNotifications,
  onOpenBrochure,
  unreadCount = 0,
  currentTab,
  onNavigate,
  currentLang = 'ur',
  onLangChange
}) => {
  const t = TRANSLATIONS[currentLang];
  const isRtl = LANGUAGES[currentLang].dir === 'rtl';

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors pt-[max(env(safe-area-inset-top),0rem)]">
      <div className="w-full sm:max-w-[480px] mx-auto px-4 py-2.5 flex justify-between items-center">
        {/* Leading: Menu Drawer Button */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-open-drawer"
            onClick={() => {
              triggerHaptic('light');
              onOpenDrawer();
            }}
            aria-label="Open navigation menu"
            className="w-10 h-10 rounded-2xl text-[#8b001f] dark:text-[#f87171] hover:bg-rose-50 dark:hover:bg-slate-800 active:scale-92 transition-all duration-150 flex items-center justify-center cursor-pointer border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
          >
            <Menu className="w-5 h-5 stroke-[2.4]" />
          </button>
        </div>

        {/* Center: Brand Title & Verified Shield */}
        <button
          id="brand-logo-btn"
          onClick={() => {
            triggerHaptic('light');
            onNavigate('home');
          }}
          className="text-center group cursor-pointer flex flex-col items-center px-2 py-0.5 rounded-xl active:scale-96 transition-transform"
        >
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#8b001f] dark:bg-rose-500 animate-pulse ring-4 ring-rose-500/20"></div>
            <h1 className="font-headline font-black text-[17px] tracking-tight text-[#8b001f] dark:text-white leading-tight">
              {t.appTitle}
            </h1>
          </div>
          <span className="text-[9.5px] tracking-wider text-amber-700 dark:text-amber-400 font-extrabold uppercase">
            {currentLang === 'sd' ? 'سرڪاري ڪميٽي ۽ لڪي ڊرا' : currentLang === 'ur' ? 'کمیٹی و قرعہ اندازی اسکیم' : 'Official Committee & Lucky Draw'}
          </span>
        </button>

        {/* Trailing: Notifications */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-notifications"
            onClick={() => {
              triggerHaptic('light');
              onOpenNotifications();
            }}
            aria-label="View notifications"
            className="relative w-10 h-10 rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-slate-800 active:scale-92 transition-all duration-150 flex items-center justify-center cursor-pointer border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
          >
            <Bell className="w-5 h-5 text-[#8b001f] dark:text-rose-400 stroke-[2.2]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

