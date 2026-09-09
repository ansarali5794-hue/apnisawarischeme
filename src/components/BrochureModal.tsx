import React, { useState } from 'react';
import { X, Phone, MapPin, CheckCircle2, Award, Users, Calendar, ShieldCheck, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';
import { VEHICLE_PROJECTS } from '../data/mockData';
import { VehicleProject } from '../types';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: VehicleProject) => void;
  projects?: VehicleProject[];
}

export const BrochureModal: React.FC<BrochureModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  projects = VEHICLE_PROJECTS
}) => {
  const [activeBrochureTab, setActiveBrochureTab] = useState<'all' | 'committee' | 'draws' | 'howto'>('all');

  if (!isOpen) return null;

  const effectiveProjects = projects && (projects || []).length > 0 ? projects : VEHICLE_PROJECTS;
  const cd70Project = effectiveProjects.find(p => p.id.includes('cd70')) || effectiveProjects[0];

  return (
    <div
      id="brochure-modal-overlay"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="brochure-modal-content"
        className="bg-[#f7faf9] text-[#181c1c] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#e9c176] overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#98001b] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-[#261900] shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Montserrat'] font-extrabold text-base sm:text-lg tracking-tight leading-tight">
                OFFICIAL APNI SAWAARI BROCHURE
              </h2>
              <p className="text-[11px] text-[#fed488] font-semibold">
                Complete Scheme Guide & Lucky Draw Catalog
              </p>
            </div>
          </div>
          <button
            id="close-brochure-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="bg-[#ebeeed] px-4 py-2 border-b border-[#e0e3e2] flex gap-2 overflow-x-auto shrink-0 hide-scrollbar">
          <button
            onClick={() => setActiveBrochureTab('all')}
            className={`px-3 py-1 text-xs font-bold font-['Montserrat'] rounded-full transition-all cursor-pointer ${
              activeBrochureTab === 'all'
                ? 'bg-[#98001b] text-white shadow-xs'
                : 'bg-white text-[#5b403f] hover:bg-[#e0e3e2]'
            }`}
          >
            Full 3-Fold Brochure
          </button>
          <button
            onClick={() => setActiveBrochureTab('committee')}
            className={`px-3 py-1 text-xs font-bold font-['Montserrat'] rounded-full transition-all cursor-pointer ${
              activeBrochureTab === 'committee'
                ? 'bg-[#98001b] text-white shadow-xs'
                : 'bg-white text-[#5b403f] hover:bg-[#e0e3e2]'
            }`}
          >
            Honda CD70 Committee
          </button>
          <button
            onClick={() => setActiveBrochureTab('draws')}
            className={`px-3 py-1 text-xs font-bold font-['Montserrat'] rounded-full transition-all cursor-pointer ${
              activeBrochureTab === 'draws'
                ? 'bg-[#98001b] text-white shadow-xs'
                : 'bg-white text-[#5b403f] hover:bg-[#e0e3e2]'
            }`}
          >
            06-Months Lucky Draws
          </button>
          <button
            onClick={() => setActiveBrochureTab('howto')}
            className={`px-3 py-1 text-xs font-bold font-['Montserrat'] rounded-full transition-all cursor-pointer ${
              activeBrochureTab === 'howto'
                ? 'bg-[#98001b] text-white shadow-xs'
                : 'bg-white text-[#5b403f] hover:bg-[#e0e3e2]'
            }`}
          >
            How to Join & Contact
          </button>
        </div>

        {/* Scrollable Brochure Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Section 1: Hero Banner Panel */}
          {(activeBrochureTab === 'all' || activeBrochureTab === 'committee') && (
            <div className="bg-gradient-to-br from-[#181c1c] via-[#2d3131] to-[#181c1c] text-white rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden border border-[#fed488]/30">
              <div className="absolute top-0 right-0 w-48 h-48 gold-gradient rounded-full opacity-10 blur-3xl pointer-events-none"></div>

              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="inline-flex items-center gap-1.5 bg-black/40 border border-[#e9c176] px-3 py-1 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-[#fed488]" />
                  <span className="text-xs font-bold text-[#fed488] uppercase tracking-wider">
                    100% SECURE & TRANSPARENT
                  </span>
                </div>
                <div className="bg-[#98001b] text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide">
                  FAIR • SECURE • TRUSTED
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-6 space-y-3">
                  <h3 className="font-['Montserrat'] font-black text-3xl sm:text-4xl text-white tracking-tight leading-none">
                    APNI <span className="gold-text-gradient">SAWAARI</span> SCHEME
                  </h3>
                  <p className="text-[#fed488] font-medium text-sm italic">
                    "Aap Ka Apna Gaari Aur Bike Jeetne Ka Khwab"
                  </p>

                  <div className="bg-[#be1e2d]/40 border border-[#be1e2d] p-3 rounded-xl">
                    <p className="text-xs text-white/90">
                      A trusted community financial empowerment initiative. Transparent monthly balloting with no hidden deductions.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                    <div className="bg-white/10 p-2 rounded-lg">
                      <p className="text-[#fed488] font-bold text-base">36</p>
                      <p className="text-[10px] text-white/80 uppercase">Month Plan</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <p className="text-[#fed488] font-bold text-base">200</p>
                      <p className="text-[10px] text-white/80 uppercase">Members</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg">
                      <p className="text-[#fed488] font-bold text-base">1 Bike</p>
                      <p className="text-[10px] text-white/80 uppercase">Monthly Draw</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-6 flex flex-col items-center">
                  <div className="relative w-full max-w-[280px] h-48 flex items-center justify-center">
                    <img
                      src={cd70Project.imageUrl}
                      alt="Honda CD70"
                      className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(254,212,136,0.3)]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectProject(cd70Project);
                    }}
                    className="w-full gold-gradient text-[#261900] font-['Montserrat'] font-extrabold text-sm py-2.5 px-4 rounded-full shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>JOIN 36-MONTH CD70 PLAN</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: CD70 Financials & Rules (Brochure Middle-Left Panel) */}
          {(activeBrochureTab === 'all' || activeBrochureTab === 'committee') && (
            <div className="bg-white rounded-2xl p-5 border border-[#e0e3e2] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#e0e3e2] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#98001b] rounded-full"></span>
                  <h4 className="font-['Montserrat'] font-bold text-lg text-[#181c1c]">
                    ★ HONDA CD70 COMMITTEE PLAN
                  </h4>
                </div>
                <span className="bg-[#fed488] text-[#785a1a] text-xs font-bold px-2.5 py-1 rounded-full">
                  Monthly Kist PKR 5,000/-
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Benefit 1 */}
                <div className="p-4 rounded-xl bg-[#fff8f8] border-l-4 border-[#98001b] shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-[#261900] shrink-0 font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#98001b] uppercase">Qurstandazi Benefit</h5>
                    <p className="text-xs text-[#5b403f] mt-0.5">
                      <strong>Naam Aane Par Agli Tamam Qistain MAAF!</strong> Once your name is drawn, the motorcycle is delivered immediately and you pay zero remaining installments.
                    </p>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="p-4 rounded-xl bg-[#f7faf9] border-l-4 border-[#775a19] shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#fed488] flex items-center justify-center text-[#785a1a] shrink-0 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-[#775a19] uppercase">Non-Winners Cash Refund</h5>
                    <p className="text-xs text-[#5b403f] mt-0.5">
                      <strong>Non-winner ko 36 months ke baad Honda CD 70 bike ki full payment return ki jaye gi.</strong> Guaranteed full motorcycle payment refund after 36 months!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: 06-Months Lucky Draw Vehicles (Brochure Middle-Right Panel) */}
          {(activeBrochureTab === 'all' || activeBrochureTab === 'draws') && (
            <div className="bg-white rounded-2xl p-5 border border-[#e0e3e2] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#e0e3e2] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-[#775a19] rounded-full"></span>
                  <h4 className="font-['Montserrat'] font-bold text-lg text-[#181c1c]">
                    06-MONTHS LUCKY DRAW PROJECTS
                  </h4>
                </div>
                <span className="text-xs text-[#5b403f] font-semibold">
                  Low Token • High Odds
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {VEHICLE_PROJECTS.slice(1).map((v) => (
                  <div
                    key={v.id}
                    className="bg-[#f7faf9] hover:bg-white border border-[#e0e3e2] hover:border-[#98001b] rounded-xl p-3 flex flex-col items-center text-center transition-all group shadow-xs cursor-pointer"
                    onClick={() => {
                      onClose();
                      onSelectProject(v);
                    }}
                  >
                    <div className="h-20 w-full flex items-center justify-center bg-white rounded-lg p-1.5 mb-2 group-hover:scale-105 transition-transform">
                      <img
                        src={v.imageUrl}
                        alt={v.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="font-['Montserrat'] font-bold text-[11px] text-[#181c1c] leading-tight line-clamp-1">
                      {v.title}
                    </span>
                    <span className="text-[10px] text-[#98001b] font-bold mt-1 bg-[#ffdad8] px-2 py-0.5 rounded-full">
                      TOKEN: PKR {v.tokenPrice?.toLocaleString()}
                    </span>
                    <button className="mt-2 text-[10px] text-[#775a19] font-bold flex items-center gap-0.5 hover:underline">
                      View details &rarr;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: How to Join & Contact Details (Brochure Right Panel) */}
          {(activeBrochureTab === 'all' || activeBrochureTab === 'howto') && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* How to Join Steps */}
              <div className="md:col-span-7 bg-white rounded-2xl p-5 border border-[#e0e3e2] shadow-sm space-y-3">
                <h4 className="font-['Montserrat'] font-extrabold text-base text-[#98001b] uppercase flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  HOW TO JOIN? (4 EASY STEPS)
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#f7faf9] border border-[#e0e3e2]">
                    <div className="w-6 h-6 rounded-full bg-[#98001b] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#181c1c]">REGISTER</p>
                      <p className="text-[11px] text-[#5b403f]">Submit your registration form with CNIC number and phone number.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#f7faf9] border border-[#e0e3e2]">
                    <div className="w-6 h-6 rounded-full bg-[#98001b] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#181c1c]">PAY MONTHLY KIST / TOKEN</p>
                      <p className="text-[11px] text-[#5b403f]">Deposit PKR 5,000/- monthly or token fee on or before 5th of each month.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#f7faf9] border border-[#e0e3e2]">
                    <div className="w-6 h-6 rounded-full bg-[#98001b] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#181c1c]">GET A CHANCE IN BALLOT</p>
                      <p className="text-[11px] text-[#5b403f]">Your official ticket number enters the monthly transparent lucky draw.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-2.5 rounded-xl bg-[#f7faf9] border border-[#e0e3e2]">
                    <div className="w-6 h-6 rounded-full bg-[#98001b] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#181c1c]">WIN & ENJOY</p>
                      <p className="text-[11px] text-[#5b403f]">Win your dream vehicle or receive full bike payment refund after 36 months!</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="md:col-span-5 bg-gradient-to-b from-[#181c1c] to-[#2d3131] text-white rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between border border-[#e9c176]/30">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-[#98001b] px-3 py-1 rounded-full text-xs font-bold text-white mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-[#fed488]" />
                    LIMITED SEATS AVAILABLE
                  </div>

                  <h4 className="font-['Montserrat'] font-extrabold text-lg text-[#fed488] mb-1">
                    REGISTER TODAY!
                  </h4>
                  <p className="text-xs text-white/80 mb-4">
                    Get in touch with our official representatives via WhatsApp or direct phone call:
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <a
                      href="tel:+923002344076"
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#fed488]" />
                      <span className="font-mono font-bold">+92 300 2344076</span>
                    </a>
                    <a
                      href="tel:+923007062190"
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#fed488]" />
                      <span className="font-mono font-bold">+92 300 7062190</span>
                    </a>
                    <a
                      href="tel:+923343219016"
                      className="flex items-center gap-2 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#fed488]" />
                      <span className="font-mono font-bold">+92 334 3219016</span>
                    </a>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-3 flex items-center justify-between text-xs text-white/80">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#fed488]" />
                    <span className="font-bold text-white uppercase">APNI SAWARI SCHEME</span>
                  </div>
                  <span className="text-[#fed488] text-[11px]">Official Support</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Bottom Guarantee Ribbon */}
          <div className="bg-[#181c1c] text-white rounded-xl p-3 border border-[#e9c176]/50 shadow-md flex flex-wrap items-center justify-around gap-2 text-center text-xs">
            <div className="flex items-center gap-1.5 text-[#fed488] font-bold">
              <Calendar className="w-4 h-4" />
              <span>36 MONTH PLAN</span>
            </div>
            <div className="w-1 h-3 bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 text-white font-bold">
              <Users className="w-4 h-4 text-[#fed488]" />
              <span>200 MEMBERS</span>
            </div>
            <div className="w-1 h-3 bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 text-[#fed488] font-bold">
              <Award className="w-4 h-4" />
              <span>MONTHLY CD70 DRAW</span>
            </div>
            <div className="w-1 h-3 bg-white/20 hidden sm:block"></div>
            <div className="flex items-center gap-1.5 text-white font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>FULL BIKE PAYMENT REFUND</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#ebeeed] px-4 py-3 border-t border-[#e0e3e2] flex items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-[#5b403f]">
            Official scheme by <strong>APNI SAWARI SCHEME</strong>
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#98001b] text-white font-bold text-xs hover:bg-[#be1e2d] transition-colors cursor-pointer shadow-xs"
          >
            Close Brochure
          </button>
        </div>
      </div>
    </div>
  );
};
