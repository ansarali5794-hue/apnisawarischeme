import React, { useState } from 'react';
import { Car, CreditCard, Award, User, Check, Copy, ShieldCheck, Ticket } from 'lucide-react';
import { UserProfile, UserActiveProject, TabType, WinnerRecord } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';

interface DashboardViewProps {
  user: UserProfile;
  activeProjects: UserActiveProject[];
  winners?: WinnerRecord[];
  onNavigate: (tab: TabType) => void;
  onPayInstallment: (project: UserActiveProject) => void;
  onBuyToken: (project: UserActiveProject) => void;
  currentLang?: LanguageType;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  activeProjects,
  winners = [],
  onNavigate,
  onPayInstallment,
  onBuyToken,
  currentLang = 'ur'
}) => {
  const t = TRANSLATIONS[currentLang];
  const [copied, setCopied] = useState(false);

  const handleCopyMemberId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const memberId = user.memberId || 'TK-2024-001';

  return (
    <div className="space-y-5 px-4 py-5 animate-in fade-in duration-300 pb-10">
      {/* Welcome Header */}
      <section className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-700 card-shadow">
        <div>
          <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
            {currentLang === 'sd' ? 'ڪسٽمر ڊيش بورڊ' : currentLang === 'ur' ? 'کسٹمر ڈیش بورڈ' : 'Customer Dashboard'}
          </span>
          <h2 className="font-headline font-black text-xl text-[#8b001f] dark:text-rose-400">
            {t.welcomeBack}, {(user?.name || user?.full_name || 'Member').split(' ')[0]}!
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs mt-0.5 font-medium">
            {currentLang === 'sd' ? 'توهان جي شامل ٿيل اسڪيمن جو تفصيل' : currentLang === 'ur' ? 'آپ کی شامل کردہ سکیموں کی تفصیل' : 'Details of your applied schemes'}
          </p>
        </div>

        <button
          id="btn-goto-profile"
          onClick={() => onNavigate('profile')}
          className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-gold text-slate-950 hover:scale-105 transition-transform cursor-pointer border border-amber-300 overflow-hidden active:scale-95"
          title="View Profile"
        >
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-slate-950" />
          )}
        </button>
      </section>

      {/* Member Financial & Token Summary Card */}
      <section className="maroon-gradient text-white rounded-3xl p-5 shadow-maroon relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-amber-300 rounded-full opacity-15 blur-2xl pointer-events-none"></div>

        <div className="flex justify-between items-center pb-3.5 border-b border-white/15">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl gold-gradient flex items-center justify-center text-slate-950 shadow-xs">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[9px] text-white/70 uppercase font-black tracking-wider block">
                {currentLang === 'sd' ? 'سرڪاري رڪارڊ' : currentLang === 'ur' ? 'سرکاری تصدیق شدہ' : 'Official Portal'}
              </span>
              <span className="text-xs font-black text-amber-300 tracking-wide">
                {currentLang === 'sd' ? 'ميمبرشپ ڪارڊ' : currentLang === 'ur' ? 'ممبرشپ کارڈ' : 'Membership Pass'}
              </span>
            </div>
          </div>

          
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-amber-300/70 font-bold uppercase tracking-widest mb-0.5">Member</span>
            <span className="text-xs font-black text-white font-mono tracking-wide truncate max-w-[100px]">{user.name}</span>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-3 my-3.5">
          <div className="bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10.5px] text-white/80 uppercase font-bold block mb-0.5">
              Applied Schemes
            </span>
            <span className="font-headline text-xl font-black text-amber-300 font-mono">
              {(activeProjects || []).length} <span className="text-xs font-normal text-white/90">Schemes</span>
            </span>
          </div>
          <div className="bg-black/25 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <span className="text-[10.5px] text-white/80 uppercase font-bold block mb-0.5">
              Total Tokens
            </span>
            <span className="font-headline text-xl font-black text-amber-300 font-mono">
              {(activeProjects || []).length} <span className="text-xs font-normal text-white/90">Tokens</span>
            </span>
          </div>
        </div>

        <div className="flex gap-2.5 pt-1">
          <button
            id="dash-explore-vehicles"
            onClick={() => onNavigate('projects')}
            className="flex-1 bg-white/15 hover:bg-white/25 active:scale-96 text-white font-black text-xs py-2.5 rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-white/20 touch-target"
          >
            <Car className="w-4 h-4 text-amber-300" />
            <span>{t.exploreVehicles}</span>
          </button>
        </div>
      </section>

      {/* Detailed Token List */}
      <section className="space-y-3">
        <h3 className="text-sm font-black text-[#181c1c] dark:text-white uppercase tracking-wider px-1">
          {currentLang === 'ur' ? 'آپ کی سکیموں کی تفصیل' : currentLang === 'sd' ? 'توهان جي اسڪيمن جو تفصيل' : 'Your Scheme Details'}
        </h3>
        
        {(activeProjects || []).length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
            <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-sm text-neutral-500 font-medium">
              {currentLang === 'ur' ? 'آپ نے ابھی تک کسی سکیم میں حصہ نہیں لیا۔' : 'You have not joined any scheme yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(activeProjects || []).map(project => {
              const hasWon = (winners || []).some(w => w.memberId === user.memberId && w.prizeWon.includes(project.projectTitle));
              // Check if project is 36 months to apply complete waive off
              const is36Months = project.projectType?.includes('36');
              
              return (
                <div key={project.id} className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex gap-3 relative overflow-hidden">
                  {hasWon && is36Months && (
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
                  )}
                  
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <img src={project.imageUrl || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=300'} alt={project.projectTitle} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-bold text-sm text-[#181c1c] dark:text-white leading-tight">
                        {project.projectTitle}
                      </h4>
                      <span className="text-[10px] font-mono font-bold bg-[#f7faf9] dark:bg-neutral-700 px-2 py-0.5 rounded-lg text-[#98001b] dark:text-rose-400 border border-[#e0e3e2] dark:border-neutral-600">
                        {project.ticketNumber}
                      </span>
                    </div>
                    
                    <p className="text-xs text-neutral-500 font-medium mb-2">
                      {currentLang === 'ur' ? 'آپ کا یہ ٹوکن چل رہا ہے' : 'Your token is active in this scheme'}
                    </p>
                    
                    {hasWon && is36Months ? (
                      <div className="mt-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl flex items-start gap-2">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-urdu font-bold leading-relaxed">
                          آپ کا ٹوکن لکی ڈرا میں نکل گیا ہے لہذا آپ کی اگلی تمام اقساط ختم ہو گئی ہیں!
                        </p>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-700 pt-2">
                        <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                          {project.projectType}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

