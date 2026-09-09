import React from 'react';
import { Home, Car, CreditCard, Award, User, LayoutDashboard } from 'lucide-react';
import { TabType } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';
import { triggerHaptic } from '../lib/haptics';

interface BottomNavBarProps {
  currentTab: TabType;
  onNavigate?: (tab: TabType) => void;
  onTabChange?: (tab: TabType) => void;
  currentLang?: LanguageType;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onNavigate,
  onTabChange,
  currentLang = 'ur'
}) => {
  const t = TRANSLATIONS[currentLang];

  const handleTabClick = (tabId: TabType) => {
    triggerHaptic('light');
    if (currentTab === tabId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (onNavigate) {
      onNavigate(tabId);
    } else if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Navigation tabs definition
  const tabs = [
    { id: 'home' as TabType, label: t.navHome, icon: Home },
    { id: 'dashboard' as TabType, label: t.navDashboard, icon: LayoutDashboard },
    { id: 'payments' as TabType, label: t.navPayments, icon: CreditCard },
    { id: 'luckydraw' as TabType, label: t.navLuckyDraw, icon: Award },
    { id: 'profile' as TabType, label: t.navProfile, icon: User },
  ];

  return (
    <nav
      id="bottom-navbar"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] w-full sm:max-w-[480px] mx-auto px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.65rem)] select-none transition-all duration-200"
    >
      <div className="flex justify-around items-center gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 rounded-2xl transition-all duration-150 cursor-pointer active:scale-90 touch-target relative ${
                isActive
                  ? 'text-[#8b001f] dark:text-amber-400 font-extrabold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div
                className={`relative px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                  isActive
                    ? 'bg-rose-100/90 dark:bg-rose-950/70 shadow-2xs scale-105 ring-1 ring-rose-300/50 dark:ring-rose-800/50'
                    : 'bg-transparent hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive
                      ? 'stroke-[2.6px] text-[#8b001f] dark:text-amber-400 scale-110'
                      : 'stroke-[1.8]'
                  }`}
                />
              </div>
              <span
                className={`nav-label text-[10px] tracking-tight mt-1 whitespace-nowrap leading-none transition-all ${
                  isActive
                    ? 'font-black text-[#8b001f] dark:text-amber-400 scale-105'
                    : 'font-semibold text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
