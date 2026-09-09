import React, { useState, useMemo } from 'react';
import { Sparkles, ArrowRight, Grid, ShieldCheck, Award, Users, ChevronRight, CreditCard, Car, Gift, FileText, CheckCircle2, PhoneCall, Flame } from 'lucide-react';
import { VEHICLE_PROJECTS } from '../data/mockData';
import { VehicleProject, TabType } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';

interface HomeViewProps {
  projects?: VehicleProject[];
  onSelectProject: (project: VehicleProject) => void;
  onNavigate: (tab: TabType) => void;
  onOpenBrochure: () => void;
  currentLang?: LanguageType;
}

export const HomeView: React.FC<HomeViewProps> = ({
  projects = VEHICLE_PROJECTS,
  onSelectProject,
  onNavigate,
  onOpenBrochure,
  currentLang = 'ur'
}) => {
  const t = TRANSLATIONS[currentLang];
  const [filter, setFilter] = useState<'all' | 'cars' | 'bikes' | 'committee'>('all');
  const effectiveProjects = useMemo(() => {
    return projects && (projects || []).length > 0 ? projects : VEHICLE_PROJECTS;
  }, [projects]);

  const filteredProjects = effectiveProjects.filter((project) => {
    if (filter === 'cars') return project.vehicleType === 'car';
    if (filter === 'bikes') return project.vehicleType === 'bike' || project.vehicleType === 'ev';
    if (filter === 'committee') return true;
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-8">
      {/* Hero Section */}
      <section className="relative bg-premium-gradient text-white w-full overflow-hidden rounded-b-[36px] shadow-glow">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/15 via-transparent to-transparent pointer-events-none"></div>

        <div className="px-4 pt-6 pb-8 relative z-10 flex flex-col items-center text-center">
          {/* Trust Shield Badge */}
          <div className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-xl border border-amber-400/40 px-4 py-1.5 rounded-full mb-3 shadow-md">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-amber-300 uppercase tracking-wider text-[11px]">
              {currentLang === 'sd' ? '100% حڪومتي تصديق ٿيل ۽ شفاف اسڪيم' : currentLang === 'ur' ? '100% باضابطہ و شفاف اسکیم' : '100% Transparent Govt Registered Scheme'}
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-headline font-black text-[24px] sm:text-[30px] text-white leading-tight mb-2 tracking-tight">
            {t.appTitle}
            <span className="gold-text-gradient block mt-1 text-xl sm:text-2xl font-black">
              {t.homeHeroTitle}
            </span>
          </h2>

          <p className="text-xs text-slate-300 max-w-[340px] mb-3.5 leading-relaxed font-medium">
            {t.homeHeroSub}
          </p>

          {/* Hero Bike Image */}
          <div className="w-full h-44 sm:h-52 relative mb-2 flex items-center justify-center">
            <img
              className="w-full h-full object-contain filter drop-shadow-2xl z-10 relative hover:scale-105 transition-transform duration-300"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDigvJ8PjGb-L5iJwa9qwHUjafy9BZkHMYF66dGWBAa4ieROthZL0gBzzr3VG88Ha7SVROzqOVA9_cmdEbEiw9pH1plk3xGXt7EQDuJrBMnCdhRqoVP4qIj1h6vuRwKfLdMGKNMMeivHNNmmyBgyF4GrfZbJ79hzdkiPnp1XCe2N9ywW9dwm4osKQTTDUEG5fFLCSMgZNKngmiRDYz2SfXmbsJ5HeGN6pHSb0h-Osdhsm1lfPP9hcy8"
              alt="Honda CD70 Motorcycle Hero"
              width={320}
              height={192}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Filter Chips */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
              filter === 'all'
                ? 'bg-[#8b001f] text-white shadow-maroon'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t.allCategories} ({effectiveProjects.length})
          </button>
          <button
            onClick={() => setFilter('committee')}
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
              filter === 'committee'
                ? 'bg-[#8b001f] text-white shadow-maroon'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            36 {t.months} Committee
          </button>
          <button
            onClick={() => setFilter('cars')}
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
              filter === 'cars'
                ? 'bg-[#8b001f] text-white shadow-maroon'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t.cars} (Alto / Cultus / Wagon R)
          </button>
          <button
            onClick={() => setFilter('bikes')}
            className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
              filter === 'bikes'
                ? 'bg-[#8b001f] text-white shadow-maroon'
                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t.motorcycles} & EVs
          </button>
        </div>
      </div>

      {/* Projects List */}
      <div className="px-4 space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0">
        {filteredProjects.map((project) => {
          const isFireBadge = project.statusBadge === 'FEW LEFT' || project.statusBadge === 'LIMITED SEATS';
          return (
            <div
              key={project.id}
              className="bg-white dark:bg-slate-800 rounded-3xl card-shadow overflow-hidden border border-slate-200/90 dark:border-slate-700 flex flex-col hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-200 group"
            >
              {/* Image & Badge Container */}
              <div className="relative h-48 bg-gradient-to-b from-slate-50 to-slate-100/80 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
                <img
                  className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                  src={project.imageUrl}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                />
                {/* Status Badge */}
                <div
                  className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm ${
                    isFireBadge
                      ? 'bg-[#8b001f] text-white'
                      : 'gold-gradient text-slate-950 border border-amber-300'
                  }`}
                >
                  {isFireBadge ? <Flame className="w-3 h-3 text-amber-300" /> : <Sparkles className="w-3 h-3 text-slate-950" />}
                  <span>{project.statusBadge}</span>
                </div>
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-white/10">
                  {`${project.durationMonths || 36}M SCHEME`}
                </div>
              </div>
              {/* Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                <div>
                  <h3 className="font-headline font-black text-base sm:text-lg text-slate-900 dark:text-white leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 font-medium">
                    {project.description}
                  </p>
                  {/* Highlights Bento Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3 p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {project.installmentAmount && project.installmentAmount > 0 ? (
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">
                          {t.monthlyInstallment}
                        </span>
                        <span className="font-headline font-black text-sm sm:text-base text-[#8b001f] dark:text-rose-400 font-mono">
                          PKR {project.installmentAmount.toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                    {project.tokenAmount && project.tokenAmount > 0 ? (
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold">
                          {currentLang === 'sd' ? 'ايڊوانس ٽڪن' : currentLang === 'ur' ? 'ایڈوانس ٹوکن' : 'Advance Token'}
                        </span>
                        <span className="font-headline font-black text-sm sm:text-base text-slate-900 dark:text-white font-mono">
                          PKR {project.tokenAmount.toLocaleString()}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
                {/* Bottom Action Button */}
                <button
                  onClick={() => onSelectProject(project)}
                  className="w-full h-11 bg-[#8b001f] hover:bg-[#a81232] text-white font-black text-xs rounded-full flex items-center justify-center gap-2 cursor-pointer transition-all shadow-maroon active:scale-96"
                >
                  <span>{t.viewDetails}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
