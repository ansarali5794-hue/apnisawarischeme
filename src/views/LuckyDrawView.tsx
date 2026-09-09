import React, { useState, useMemo } from 'react';
import { Award, Calendar, Users, Gift, Play, Sparkles, CheckCircle2, Trophy, Clock } from 'lucide-react';
import { WINNERS_LIST, VEHICLE_PROJECTS } from '../data/mockData';
import { WinnerRecord, VehicleProject, UserActiveProject } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';

interface LuckyDrawViewProps {
  onOpenLiveDraw?: () => void;
  winners?: WinnerRecord[];
  projects?: VehicleProject[];
  activeProjects?: UserActiveProject[];
  currentLang?: LanguageType;
}

// ------------------------------------------------------------------
// Memoized Winner Item Card
// ------------------------------------------------------------------
const WinnerCard = React.memo<{ winner: WinnerRecord; isFullWidth: boolean }>(({ winner, isFullWidth }) => {
  return (
    <div
      className={`${isFullWidth ? 'w-full' : 'min-w-[250px] max-w-[270px]'} bg-white dark:bg-[#2d3131] rounded-2xl p-4 card-shadow border border-[#f1e2e1] dark:border-neutral-700 flex flex-col gap-2.5 shrink-0`}
    >
      <div className="flex items-center gap-3 border-b border-[#e2e8f0] dark:border-neutral-700 pb-2.5">
        <div className="w-11 h-11 rounded-2xl bg-[#ebeeed] overflow-hidden shrink-0 border border-[#e0e3e2]">
          {winner.avatarUrl ? (
            <img
              src={winner.avatarUrl}
              alt={winner.name}
              width={44}
              height={44}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#556375]">
              <Award className="w-5 h-5" />
            </div>
          )}
        </div>

        <div>
          <p className="font-headline font-bold text-xs sm:text-sm text-[#181c1c] dark:text-white">
            {winner.name}
          </p>
          <p className="text-[10.5px] text-[#5b403f] dark:text-neutral-400 font-mono font-semibold">
            Token: {winner.memberId || winner.ticketNumber}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-[#785a1a] dark:text-[#fed488] font-black">
        <Award className="w-4 h-4 shrink-0 text-[#98001b]" />
        <span className="truncate">Won: {winner.prizeWon}</span>
      </div>

      <div className="flex justify-between items-center text-[10px] text-[#5b403f] dark:text-neutral-400 pt-1 font-medium">
        <span className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
          Verified Winner
        </span>
        <span>{winner.date}</span>
      </div>
    </div>
  );
});

// ------------------------------------------------------------------
// Main Lucky Draw View Component
// ------------------------------------------------------------------
export const LuckyDrawView: React.FC<LuckyDrawViewProps> = ({
  onOpenLiveDraw,
  winners = WINNERS_LIST,
  projects = VEHICLE_PROJECTS,
  activeProjects = [],
  currentLang = 'ur'
}) => {
  const t = TRANSLATIONS[currentLang];
  const [showAllWinners, setShowAllWinners] = useState(false);

  const effectiveWinners = useMemo(() => {
    return winners && (winners || []).length > 0 ? winners : WINNERS_LIST;
  }, [winners]);

  const primaryProject = useMemo(() => {
    return (projects || []).find(p => p.id.includes('cd70')) || projects[0] || VEHICLE_PROJECTS[0];
  }, [projects]);

  return (
    <div className="space-y-5 px-4 py-5 animate-in fade-in duration-300 pb-10">
      {/* Header Section */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center justify-center space-x-1.5 gold-gradient px-3.5 py-1 rounded-full shadow-gold mb-1">
          <Award className="w-4 h-4 text-[#785a1a]" />
          <span className="font-black text-xs text-[#785a1a] uppercase tracking-wide">
            {t.navLuckyDraw}
          </span>
        </div>

        <h2 className="font-headline font-black text-2xl text-[#98001b] dark:text-[#ffb3b0]">
          {t.luckyDrawHeading}
        </h2>
        <p className="text-[#5b403f] dark:text-neutral-400 text-xs max-w-sm mx-auto leading-relaxed font-medium">
          {t.luckyDrawSub}
        </p>
      </div>

      {/* Upcoming Draw Bento Card */}
      <section className="bg-white dark:bg-[#2d3131] rounded-3xl card-shadow overflow-hidden border border-[#f1e2e1] dark:border-neutral-700">
        {/* Date Header Strip */}
        <div className="bg-[#98001b] text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#fed488]" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              {t.nextDrawDate}
            </h3>
          </div>
          <div className="font-headline font-black text-lg text-[#fed488]">
            15th Nov, 2024
          </div>
        </div>

        <div className="p-4 sm:p-5 relative">
          {/* Vehicle Prize Feature */}
          <div className="flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-[#f8faf9] dark:bg-neutral-800 h-52 flex items-center justify-center p-4 border border-[#e2e8f0] dark:border-neutral-700">
              <img
                className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal"
                src={primaryProject.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuCo_K90tCVO1uyuYMYILaAG1qzDtm2s7ku-HXpHcOuNnLP-s9eIV9xHVj9ZcWeCxY3PmgzJ_b9_fmY_AJ5trONt1VFWmHGGEILlkctVygoXgY4KNWBHzofvJQHpQWLPOllg1TYNQVTaS530_8Gfq3MM0BAK2KfsXJxsO42gOiVQFffOhECHsPmauo_C6tuxvjbf9dx-JE4CwVRSjC7ox9ofvEeUNB9X5oNIqrqc51ndTwwk1Qyjh0bM"}
                alt={primaryProject.title || "Lucky Draw Prize"}
                loading="lazy"
                decoding="async"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 flex justify-between items-end">
                <h4 className="text-white font-headline font-black text-base sm:text-lg">
                  {primaryProject.title}
                </h4>
                <span className="gold-gradient text-[#785a1a] text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  {currentLang === 'sd' ? 'پهرين انعام' : currentLang === 'ur' ? 'پہلا انعام' : '1st Prize'}
                </span>
              </div>

              {/* Floating Trophy Badge */}
              <div className="absolute top-3 right-3 gold-gradient text-[#785a1a] rounded-full w-10 h-10 flex items-center justify-center shadow-gold border border-[#e9c176]">
                <Award className="w-5 h-5 text-[#98001b]" />
              </div>
            </div>

            {/* Prize Value */}
            <div className="bg-[#f8faf9] dark:bg-neutral-800 rounded-2xl p-3.5 flex items-center justify-between border border-[#e2e8f0] dark:border-neutral-700">
              <div>
                <p className="text-[10px] text-[#5b403f] dark:text-neutral-400 uppercase tracking-wider font-bold">
                  {currentLang === 'sd' ? 'انعام جي ماليت' : currentLang === 'ur' ? 'انعام کی مالیت' : 'Prize Value'}
                </p>
                <p className="font-headline font-black text-xl text-[#98001b] dark:text-[#ffb3b0]">
                  {primaryProject.monthlyKist ? `PKR ${(primaryProject.monthlyKist * (primaryProject.durationMonths || 36)).toLocaleString()}` : `Token PKR ${primaryProject.tokenPrice}`}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-[#ffdad8] text-[#98001b] flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#2d3131] rounded-3xl p-4 card-shadow border border-[#f1e2e1] dark:border-neutral-700 flex flex-col items-center justify-center text-center space-y-1 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl gold-gradient text-[#785a1a] flex items-center justify-center mb-1">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-[#5b403f] dark:text-neutral-400 font-bold uppercase">
            {currentLang === 'sd' ? 'ڪل ميمبر' : currentLang === 'ur' ? 'کل ممبرز' : 'Total Members'}
          </p>
          <p className="font-headline font-black text-2xl text-[#181c1c] dark:text-white">
            200
          </p>
        </div>

        <div className="bg-white dark:bg-[#2d3131] rounded-3xl p-4 card-shadow border border-[#f1e2e1] dark:border-neutral-700 flex flex-col items-center justify-center text-center space-y-1 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-[#ffdad8] text-[#98001b] flex items-center justify-center mb-1">
            <Trophy className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-[#5b403f] dark:text-neutral-400 font-bold uppercase">
            {currentLang === 'sd' ? 'ڪل کٽيندڙ' : currentLang === 'ur' ? 'کل فاتحین' : 'Total Winners'}
          </p>
          <p className="font-headline font-black text-2xl text-[#181c1c] dark:text-white">
            {effectiveWinners.length}
          </p>
        </div>
      </div>

      {/* Previous Winners (Horizontal Scroll) */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-headline font-bold text-base sm:text-lg text-[#181c1c] dark:text-white">
            {t.officialWinners}
          </h3>
          <button
            onClick={() => setShowAllWinners(!showAllWinners)}
            className="text-xs font-bold text-[#98001b] dark:text-[#fed488] hover:underline cursor-pointer"
          >
            {showAllWinners
              ? currentLang === 'sd' ? 'گهٽ ڏسو' : currentLang === 'ur' ? 'کم دیکھیں' : 'Show Less'
              : currentLang === 'sd' ? 'سڀ ڏسو' : currentLang === 'ur' ? 'تمام دیکھیں' : 'View All'}
          </button>
        </div>

        <div className={`flex ${showAllWinners ? 'flex-col space-y-3' : 'overflow-x-auto gap-3 pb-2 hide-scrollbar -mx-4 px-4'}`}>
          {effectiveWinners.map((winner) => (
            <WinnerCard key={winner.id} winner={winner} isFullWidth={showAllWinners} />
          ))}
        </div>
      </section>
    </div>
  );
};

