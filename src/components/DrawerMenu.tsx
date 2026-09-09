import React from 'react';
import { X, Home, Car, CreditCard, Award, User, FileText, Phone, HelpCircle, LogOut, Sparkles, MapPin, ShieldCheck, Globe } from 'lucide-react';
import { TabType, UserProfile } from '../types';
import { LanguageType, TRANSLATIONS, LANGUAGES } from '../lib/translations';
import { LanguageDropdown } from './LanguageDropdown';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: TabType;
  onNavigate: (tab: TabType) => void;
  user: UserProfile;
  onOpenBrochure: () => void;
  onLogout: () => void;
  currentLang?: LanguageType;
  onLangChange?: (lang: LanguageType) => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  onNavigate,
  user,
  onOpenBrochure,
  onLogout,
  currentLang = 'ur',
  onLangChange
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[currentLang];

  const handleNav = (tab: TabType) => {
    onNavigate(tab);
    onClose();
  };

  return (
    <div
      id="drawer-overlay"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="drawer-container"
        className="w-[85%] max-w-[320px] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-slate-200/80 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div>
          <div className="maroon-gradient text-white p-5 relative overflow-hidden shadow-md">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 gold-gradient rounded-full opacity-20 blur-xl pointer-events-none"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/80 bg-white/10 shrink-0 shadow-sm">
                  <img
                    src={user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-headline font-black text-base leading-tight">
                    {user.name}
                  </h3>
                  <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-1 shadow-2xs font-mono">
                    Token: {user.memberId}
                  </span>
                </div>
              </div>

              <button
                id="btn-close-drawer"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer active:scale-90"
              >
                <X className="w-4 h-4 stroke-[2.4]" />
              </button>
            </div>

            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-3 flex justify-between items-center text-xs border border-white/10 relative z-10">
              <div>
                <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">{t.activeTokens}</p>
                <p className="font-extrabold text-amber-300 text-sm font-mono">{user.activeTokensCount || 0} Entries</p>
              </div>
              <div className="text-right">
                <p className="text-white/70 text-[10px] uppercase font-bold tracking-wider">{t.totalContributed}</p>
                <p className="font-extrabold text-white text-sm font-mono">PKR {(user.totalPaidAmount || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-1.5">
            {onLangChange && (
              <div className="mb-4">
                <LanguageDropdown
                  currentLang={currentLang}
                  onLangChange={onLangChange}
                  variant="light"
                  className="w-full flex justify-center"
                />
              </div>
            )}
            <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
              {t.menuLabel}
            </p>

            {[
              { id: 'home' as TabType, label: t.navHome, icon: Home },
              { id: 'dashboard' as TabType, label: t.navDashboard, icon: User },
              { id: 'payments' as TabType, label: t.navPayments, icon: CreditCard },
              { id: 'luckydraw' as TabType, label: t.navLuckyDraw, icon: Award },
              { id: 'profile' as TabType, label: t.navProfile, icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer active:scale-98 ${
                    isActive
                      ? 'bg-rose-100/90 dark:bg-rose-950/60 text-[#8b001f] dark:text-rose-400 font-extrabold shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#8b001f] dark:text-rose-400 stroke-[2.4]' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 my-2"></div>
            <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-2">
              {t.officialDocsLabel}
            </p>

            <button
              onClick={() => {
                onClose();
                onOpenBrochure();
              }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl gold-gradient text-slate-950 font-black text-xs shadow-gold hover:brightness-105 transition-all cursor-pointer active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#8b001f]" />
                <span>{t.brochureBtn}</span>
              </div>
              <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded-full uppercase font-black">
                {currentLang === 'sd' ? 'کوليو' : currentLang === 'ur' ? 'کھولیں' : 'View'}
              </span>
            </button>

            <button
              onClick={() => handleNav('terms')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer active:scale-98 ${
                currentTab === 'terms'
                  ? 'bg-rose-100/90 dark:bg-rose-950/60 text-[#8b001f] dark:text-rose-400 font-extrabold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 text-[#8b001f] dark:text-rose-400" />
              <div className={currentLang === 'en' ? 'text-left' : 'text-right'}>
                <p>{t.termsBtn}</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                  {currentLang === 'sd' ? 'سرڪاري پاليسي' : currentLang === 'ur' ? 'سرکاری پالیسی' : 'Official Policy'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Help & Contact Footer */}
        <div className="p-4 bg-slate-100/90 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
            <div className="flex items-center gap-1.5 font-black text-[#8b001f] dark:text-rose-400 mb-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{t.helplineBtn}</span>
            </div>
            <a
              href="tel:+923002344076"
              className="text-xs text-slate-900 dark:text-white font-mono font-black block hover:text-[#8b001f] transition-colors"
            >
              +92 300 2344076
            </a>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              {currentLang === 'sd' ? 'پنهنجي سواري اسڪيم سرڪاري هيلپ لائن' : currentLang === 'ur' ? 'اپنی سواری اسکیم آفیشل ہیلپ لائن' : 'Apni Sawari Scheme Official Helpline'}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-2xl border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-extrabold text-xs transition-all cursor-pointer active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logoutBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
