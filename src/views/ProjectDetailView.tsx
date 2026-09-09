import React from 'react';
import { ArrowLeft, Flame, Star, CreditCard, Calendar, Gift, Wallet, Users, Award, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Check } from 'lucide-react';
import { VehicleProject } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';

interface ProjectDetailViewProps {
  project: VehicleProject;
  onBack: () => void;
  onJoinClick: (project: VehicleProject) => void;
  currentLang?: LanguageType;
}

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  onBack,
  onJoinClick,
  currentLang = 'ur'
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <div className="min-h-screen relative pb-28 animate-in fade-in duration-300">
      {/* Header Image Section */}
      <div className="relative h-64 sm:h-72 w-full bg-gradient-to-b from-slate-50 to-slate-100/90 dark:from-slate-900 dark:to-slate-800 overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-slate-800">
        {/* Back Button */}
        <button
          id="btn-back-from-detail"
          onClick={onBack}
          aria-label="Go back"
          className="absolute top-4 left-4 z-20 w-11 h-11 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-slate-800 dark:text-white shadow-md border border-slate-200/80 dark:border-slate-700 hover:bg-white transition-all cursor-pointer touch-target active:scale-92"
        >
          <ArrowLeft className="w-5 h-5 text-slate-800 dark:text-white stroke-[2.2]" />
        </button>

        <img
          className="w-full h-full object-contain p-6 relative z-0 filter drop-shadow-xl"
          src={project.imageUrl}
          alt={project.title}
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Content Canvas */}
      <div className="px-4 py-5 space-y-4">
        {/* Project Title & Badge */}
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10.5px] font-black uppercase text-amber-700 dark:text-amber-400 block tracking-wider">
              {`${project.durationMonths || 36} Months Scheme`}
            </span>
            <h1 className="font-headline font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
              {project.title}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
              {project.subtitle}
            </p>
          </div>

          <div
            className={`font-black text-xs px-3.5 py-1.5 rounded-full shadow-xs flex items-center gap-1 shrink-0 ${
              project.statusBadge === 'LIMITED SEATS' || project.statusBadge === 'FEW LEFT'
                ? 'bg-[#8b001f] text-white shadow-maroon'
                : 'gold-gradient text-slate-950 border border-amber-300 shadow-gold'
            }`}
          >
            {project.statusBadge === 'LIMITED SEATS' || project.statusBadge === 'FEW LEFT' ? (
              <Flame className="w-3.5 h-3.5 text-amber-300" />
            ) : (
              <Star className="w-3.5 h-3.5 fill-current" />
            )}
            <span>{project.statusBadge}</span>
          </div>
        </div>

                {/* Core Financials Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Monthly Kist */}
          {project.monthlyKist && project.monthlyKist > 0 ? (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl card-shadow border border-slate-200/90 dark:border-slate-700 flex flex-col justify-center items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-[#8b001f] dark:text-rose-400 flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </div>
              <p className="font-bold text-[10.5px] text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                {t.monthlyInstallment}
              </p>
              <p className="font-headline font-black text-xl text-[#8b001f] dark:text-rose-400 font-mono">
                PKR {project.monthlyKist.toLocaleString()}
              </p>
            </div>
          ) : null}

          {/* Token Price */}
          {project.tokenPrice && project.tokenPrice > 0 ? (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl card-shadow border border-slate-200/90 dark:border-slate-700 flex flex-col justify-center items-center text-center">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <CreditCard className="w-5 h-5 stroke-[2.2]" />
              </div>
              <p className="font-bold text-[10.5px] text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                {currentLang === 'sd' ? 'ايڊوانس ٽڪن' : currentLang === 'ur' ? 'ایڈوانس ٹوکن' : 'Advance Token'}
              </p>
              <p className="font-headline font-black text-xl text-blue-600 dark:text-blue-400 font-mono">
                PKR {project.tokenPrice.toLocaleString()}
              </p>
            </div>
          ) : null}

          {/* Duration */}
          {project.durationMonths && project.durationMonths > 0 ? (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl card-shadow border border-slate-200/90 dark:border-slate-700 flex flex-col justify-center items-center text-center">
              <div className="w-11 h-11 rounded-2xl gold-gradient text-slate-950 flex items-center justify-center mb-2 shadow-xs">
                <Calendar className="w-5 h-5 stroke-[2.2]" />
              </div>
              <p className="font-bold text-[10.5px] text-slate-500 dark:text-slate-400 uppercase mb-0.5">
                {t.totalDuration}
              </p>
              <p className="font-headline font-black text-xl text-slate-900 dark:text-white font-mono">
                {project.durationMonths} <span className="text-xs font-semibold text-slate-500">{t.months}</span>
              </p>
            </div>
          ) : null}
        </div>


        {/* Key Benefits List */}
        <div className="space-y-3">
          <h2 className="font-headline font-black text-base text-slate-900 dark:text-white">
            {currentLang === 'sd' ? 'منصوبي جا فائدا' : currentLang === 'ur' ? 'پروجیکٹ کے فوائد' : 'Scheme Highlights & Rules'}
          </h2>

          {/* Lucky Draw Benefit */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl card-shadow border border-slate-200/90 dark:border-slate-700 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl gold-gradient flex items-center justify-center shrink-0 shadow-gold text-slate-950">
              <Gift className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase mb-0.5">
                {currentLang === 'sd' ? 'قرعه اندازي فائدا' : currentLang === 'ur' ? 'قرعہ اندازی فوائد' : 'Lucky Draw Benefit'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {project.qurstandaziBenefit || (currentLang === 'sd' ? 'نالو نڪرڻ تي باقي سڀ قسطون معاف!' : 'نام آنے پر اگلی تمام قسطیں معاف! شفاف قرعہ اندازی')}
              </p>
            </div>
          </div>

          {/* Non-Winners Refund */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl card-shadow border border-slate-200/90 dark:border-slate-700 flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-[#8b001f] dark:text-rose-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-headline font-black text-xs sm:text-sm text-slate-900 dark:text-white uppercase mb-0.5">
                {currentLang === 'sd' ? 'رقم جي مڪمل گارنٽي' : currentLang === 'ur' ? 'رقم کی واپسی یا گاڑی کی ترسیل' : 'Guaranteed Maturity Returns'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-1 leading-relaxed font-medium">
                {project.id === 'honda-cd70-36m'
                  ? (currentLang === 'sd' ? 'مدت پوري ٿيڻ تي هر ميمبر کي موٽر سائيڪل يا مڪمل رقم واپس ڪئي ويندي.' : 'کمیٹی کی مدت مکمل ہونے پر ہونڈا سی ڈی 70 موٹر سائیکل یا باضابطہ مکمل رقم لازمی فراہم کی جاتی ہے۔')
                  : `Guaranteed Cash Refund / Protection (After ${project.durationMonths} Months)`}
              </p>
              <p className="font-black text-xs text-[#8b001f] dark:text-rose-400">
                {project.nonWinnersRefundText || '100% Full Payment Return Guarantee'}
              </p>
            </div>
          </div>
        </div>

        {/* Committee Options */}
        <div className="bg-slate-950 text-white p-5 rounded-3xl relative overflow-hidden shadow-flutter-3 border border-amber-400/30">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 gold-gradient rounded-full opacity-10 blur-2xl"></div>

          <h3 className="font-headline font-black text-sm sm:text-base mb-3.5 flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-amber-300" />
            <span>{currentLang === 'sd' ? 'ڪميٽي تفصيل' : currentLang === 'ur' ? 'کمیٹی تفصیلات' : 'Committee Structure'}</span>
          </h3>

          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
            <span className="text-xs text-slate-300 font-semibold">Total Registered Members</span>
            <span className="font-headline font-black text-lg text-amber-300 font-mono">
              {project.totalMembers || 200}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300 font-semibold">{t.monthlyLuckyDraw}</span>
            <span className="font-black text-xs gold-gradient text-slate-950 px-3.5 py-1 rounded-full shadow-xs">
              {project.monthlyDrawPrize || '1 Brand New Bike'}
            </span>
          </div>
        </div>

        {/* Vehicle Specifications */}
        {project.specs && (
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-700 space-y-2.5 card-shadow">
            <h4 className="font-headline font-black text-xs uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Vehicle Highlights
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Engine / Motor:</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{project.specs.engine}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">Mileage / Range:</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{project.specs.mileage}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] z-40">
        <button
          id="btn-sticky-join-project"
          onClick={() => onJoinClick(project)}
          className="w-full h-12 gold-gradient text-slate-950 font-black text-sm rounded-full shadow-gold hover:opacity-95 active:scale-96 transition-all flex justify-center items-center gap-2 cursor-pointer touch-target border border-amber-300"
        >
          <span>{t.payKistBtn}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};

