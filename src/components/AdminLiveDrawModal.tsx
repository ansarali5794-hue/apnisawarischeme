import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Award,
  Sparkles,
  RefreshCw,
  Trophy,
  CheckCircle2,
  Users,
  Car,
  Gift,
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  Search,
  Check
} from 'lucide-react';
import { UserProfile, UserActiveProject, PaymentRecord, VehicleProject, WinnerRecord } from '../types';
import { LanguageType } from '../lib/translations';

interface CandidateToken {
  tokenNumber: string;
  userName: string;
  userId?: string;
  phone?: string;
  city?: string;
  projectTitle: string;
}

interface AdminLiveDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserProfile[];
  activeProjects?: UserActiveProject[];
  payments?: PaymentRecord[];
  projects?: VehicleProject[];
  onAddWinner: (winner: WinnerRecord) => void;
  currentLang?: LanguageType;
}

export const AdminLiveDrawModal: React.FC<AdminLiveDrawModalProps> = ({
  isOpen,
  onClose,
  users,
  activeProjects = [],
  payments = [],
  projects = [],
  onAddWinner,
  currentLang = 'ur'
}) => {
  const [selectedScheme, setSelectedScheme] = useState<string>('all');
  const [customPrize, setCustomPrize] = useState<string>('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [displayToken, setDisplayToken] = useState<string>('---');
  const [displayName, setDisplayName] = useState<string>('---');
  const [selectedWinner, setSelectedWinner] = useState<CandidateToken | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [showCandidateList, setShowCandidateList] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const spinIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // -------------------------------------------------------------
  // Automatically Aggregate all registered members and issued tokens
  // -------------------------------------------------------------
  const candidatePool = useMemo<CandidateToken[]>(() => {
    const map = new Map<string, CandidateToken>();

    // 1. Add from active enrolled projects
    activeProjects.forEach((act) => {
      const token = act.ticketNumber || act.userToken;
      if (token) {
        const key = `${token}-${act.projectTitle}`;
        const matchedUser = (users || []).find((u) => u.id === act.userId || u.uid === act.userId || u.memberId === token);
        map.set(key, {
          tokenNumber: token,
          userName: act.userName || matchedUser?.name || matchedUser?.full_name || 'Active Member',
          userId: act.userId,
          phone: matchedUser?.phone || matchedUser?.phoneNumber || '',
          city: matchedUser?.address || 'Hyderabad',
          projectTitle: act.projectTitle || 'HONDA CD 70cc (2026)'
        });
      }
    });

    // 2. Add from registered users (Every member has an issued token number)
    users.forEach((u) => {
      const token = u.memberId;
      if (token) {
        const key = `${token}-general`;
        if (!map.has(key)) {
          map.set(key, {
            tokenNumber: token,
            userName: u.name || u.full_name || 'Member',
            userId: u.id || u.uid,
            phone: u.phone || u.phoneNumber || '',
            city: u.address || 'Hyderabad',
            projectTitle: projects[0]?.title || 'HONDA CD 70cc (2026)'
          });
        }
      }
    });

    // 3. Add from payment records with tokens
    payments.forEach((p) => {
      if (p.userToken && p.userName) {
        const key = `${p.userToken}-${p.projectName}`;
        if (!map.has(key)) {
          const matchedUser = (users || []).find((u) => u.memberId === p.userToken || u.id === p.userId);
          map.set(key, {
            tokenNumber: p.userToken,
            userName: p.userName || matchedUser?.name || 'Member',
            userId: p.userId,
            phone: matchedUser?.phone || '',
            city: matchedUser?.address || 'Hyderabad',
            projectTitle: p.projectName || 'HONDA CD 70cc (2026)'
          });
        }
      }
    });

    const list = Array.from(map.values());

    // Fallback baseline participants if completely empty database
    if (list.length === 0) {
      return [
        { tokenNumber: 'TK-2026-101', userName: 'Muhammad Bilal', city: 'Hyderabad', projectTitle: 'HONDA CD 70cc (2026)' },
        { tokenNumber: 'TK-2026-102', userName: 'Ali Raza', city: 'Karachi', projectTitle: 'HONDA CD 70cc (2026)' },
        { tokenNumber: 'TK-2026-103', userName: 'Zubair Ahmed', city: 'Sukkur', projectTitle: 'HONDA CD 70cc (2026)' },
        { tokenNumber: 'TK-2026-104', userName: 'Kamran Khan', city: 'Larkana', projectTitle: 'HONDA CD 70cc (2026)' },
        { tokenNumber: 'TK-2026-105', userName: 'Tariq Mehmood', city: 'Nawabshah', projectTitle: 'HONDA CD 70cc (2026)' },
        { tokenNumber: 'TK-2026-106', userName: 'Asif Ali Jamali', city: 'Hyderabad', projectTitle: 'HONDA CD 70cc (2026)' }
      ];
    }

    return list;
  }, [users, activeProjects, payments, projects]);

  // Filter candidates by scheme if selected
  const filteredCandidates = useMemo(() => {
    let pool = candidatePool;
    if (selectedScheme !== 'all') {
      pool = pool.filter(
        (c) => c.projectTitle.toLowerCase().includes(selectedScheme.toLowerCase()) ||
               selectedScheme.toLowerCase().includes(c.projectTitle.toLowerCase())
      );
      // If none match specific filter, fall back to entire pool
      if (pool.length === 0) pool = candidatePool;
    }

    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      pool = pool.filter(
        (c) => c.tokenNumber.toLowerCase().includes(q) ||
               c.userName.toLowerCase().includes(q) ||
               (c.phone && c.phone.includes(q)) ||
               (c.city && c.city.toLowerCase().includes(q))
      );
    }

    return pool;
  }, [candidatePool, selectedScheme, searchFilter]);

  // Determine active prize
  const effectivePrize = useMemo(() => {
    if (customPrize.trim()) return customPrize.trim();
    if (selectedScheme !== 'all') {
      const matched = (projects || []).find((p) => p.title === selectedScheme || p.id === selectedScheme);
      if (matched) return matched.title;
    }
    return projects[0]?.title || 'Brand New HONDA CD 70cc (2026)';
  }, [customPrize, selectedScheme, projects]);

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Run Live Ballot Simulation
  // -------------------------------------------------------------
  const handleStartBallot = () => {
    if (filteredCandidates.length === 0) return;

    setIsSpinning(true);
    setSelectedWinner(null);
    setSavedSuccess(false);

    let counter = 0;
    const totalTicks = 32;

    if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);

    spinIntervalRef.current = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredCandidates.length);
      const candidate = filteredCandidates[randomIndex];

      setDisplayToken(candidate.tokenNumber);
      setDisplayName(candidate.userName);
      counter++;

      if (counter >= totalTicks) {
        if (spinIntervalRef.current) clearInterval(spinIntervalRef.current);
        setIsSpinning(false);

        // Pick official final winner randomly
        const finalWinnerIndex = Math.floor(Math.random() * filteredCandidates.length);
        const winner = filteredCandidates[finalWinnerIndex];

        setDisplayToken(winner.tokenNumber);
        setDisplayName(winner.userName);
        setSelectedWinner(winner);

        // AUTO-SAVE WINNER TO FIRESTORE & APP STATE
        const newWinnerRecord: WinnerRecord = {
          id: `win-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          name: winner.userName,
          memberId: winner.tokenNumber,
          ticketNumber: winner.tokenNumber,
          prizeWon: effectivePrize,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          city: winner.city || 'Hyderabad',
          drawMonth: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
          photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400'
        };

        onAddWinner(newWinnerRecord);
        setSavedSuccess(true);
      }
    }, 85);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-[#181c1c] via-[#222727] to-[#141818] text-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#fed488]/40 overflow-hidden my-auto p-5 sm:p-6 relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 gold-gradient px-4 py-1 rounded-full text-[#261900] text-xs font-black font-['Montserrat'] shadow-gold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ADMIN LIVE BALLOTING MACHINE</span>
        </div>

        <h3 className="font-headline font-black text-xl sm:text-2xl text-white tracking-tight">
          {currentLang === 'sd' ? '   ' : currentLang === 'ur' ? '    ' : 'Official Digital Lucky Draw'}
        </h3>
        <p className="text-xs text-[#fed488] mb-4">
          {currentLang === 'sd'
            ? '        •     '
            : currentLang === 'ur'
            ? '          •    '
            : 'All registered members and issued tokens are automatically loaded in the draw pool'}
        </p>

        {/* Scheme & Prize Selectors */}
        <div className="bg-black/40 border border-neutral-700/80 rounded-2xl p-3 mb-4 text-left space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-[10.5px] font-bold text-neutral-300 uppercase mb-1">
                Select Scheme
              </label>
              <select
                value={selectedScheme}
                onChange={(e) => setSelectedScheme(e.target.value)}
                disabled={isSpinning}
                className="w-full bg-[#181c1c] border border-neutral-600 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#fed488]"
              >
                <option value="all">All Enrolled Schemes ({candidatePool.length} Tokens)</option>
                {(projects || []).map((p) => (
                  <option key={p.id} value={p.title}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10.5px] font-bold text-neutral-300 uppercase mb-1">
                Prize Title
              </label>
              <input
                type="text"
                value={customPrize}
                onChange={(e) => setCustomPrize(e.target.value)}
                placeholder={effectivePrize}
                disabled={isSpinning}
                className="w-full bg-[#181c1c] border border-neutral-600 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#fed488]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-neutral-800">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              Eligible Tokens in Pool: <strong>{filteredCandidates.length}</strong>
            </span>
            <button
              type="button"
              onClick={() => setShowCandidateList(!showCandidateList)}
              className="text-[#fed488] hover:underline cursor-pointer font-bold"
            >
              {showCandidateList ? 'Hide Participant Pool' : 'View Candidate Pool List'}
            </button>
          </div>

          {/* Collapsible Candidate Pool List */}
          {showCandidateList && (
            <div className="bg-[#141818] border border-neutral-700 rounded-xl p-2.5 mt-2 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 bg-black/60 px-2 py-1 rounded-lg border border-neutral-700">
                <Search className="w-3 h-3 text-neutral-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search token #, name or city..."
                  className="w-full bg-transparent text-[11px] text-white outline-none"
                />
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1 pr-1 font-mono text-[10.5px]">
                {filteredCandidates.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white/5 px-2 py-1 rounded border border-white/5"
                  >
                    <span className="font-bold text-[#fed488]">{c.tokenNumber}</span>
                    <span className="text-white truncate max-w-[150px]">{c.userName}</span>
                    <span className="text-neutral-400 text-[9.5px]">{c.city || 'Verified'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Digital Ballot Rolling Display Box */}
        <div className="bg-black/80 border-2 border-[#fed488] rounded-3xl p-5 mb-4 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 gold-gradient rounded-full opacity-15 blur-2xl pointer-events-none"></div>

          <p className="text-[10.5px] text-neutral-400 font-mono tracking-widest uppercase mb-1">
            BALLOT STATUS:{' '}
            <strong className={isSpinning ? 'text-amber-400 animate-pulse' : selectedWinner ? 'text-emerald-400' : 'text-neutral-200'}>
              {isSpinning ? 'SPINNING CANDIDATE POOL...' : selectedWinner ? '🎉 WINNER IDENTIFIED!' : 'READY TO DRAW'}
            </strong>
          </p>

          <div
            className={`font-mono text-3xl sm:text-4xl font-black tracking-wider my-2 transition-all ${
              isSpinning ? 'text-amber-400 scale-105 animate-pulse' : 'text-[#fed488]'
            }`}
          >
            {displayToken}
          </div>

          <p className="font-headline font-bold text-sm text-white mb-2 truncate">
            {displayName !== '---' ? displayName : 'Press button below to initiate ballot'}
          </p>

          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[11px] text-neutral-300">
            <Award className="w-3.5 h-3.5 text-[#fed488]" />
            <span>Prize: <strong>{effectivePrize}</strong></span>
          </div>
        </div>

        {/* Winner Announcement & Instant Broadcast Card */}
        {selectedWinner && (
          <div className="bg-emerald-950/70 border border-emerald-500/80 rounded-2xl p-4 mb-4 text-left space-y-2 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>OFFICIAL DRAW RESULT:</span>
              </div>
              <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                VERIFIED &amp; BROADCASTED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-900/80">
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Winner Member</span>
                <strong className="text-white text-sm">{selectedWinner.userName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 block uppercase">Winning Token #</span>
                <strong className="text-[#fed488] font-mono text-sm">{selectedWinner.tokenNumber}</strong>
              </div>
            </div>

            <div className="bg-black/50 p-2.5 rounded-xl text-xs space-y-1">
              <div className="text-neutral-200">
                🎁 Won: <strong className="text-white">{effectivePrize}</strong>
              </div>
              <div className="text-emerald-300 font-bold text-[11px]">
                🌟      !     (All remaining installments waived!)
              </div>
            </div>

            {savedSuccess && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-bold bg-emerald-900/40 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>              !</span>
              </div>
            )}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2.5">
          <button
            onClick={handleStartBallot}
            disabled={isSpinning || filteredCandidates.length === 0}
            className="w-full gold-gradient text-[#261900] font-headline font-black text-sm py-3.5 rounded-full shadow-gold hover:brightness-105 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-target border border-[#e9c176]"
          >
            <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>
              {isSpinning
                ? 'BALLOTING IN PROGRESS...'
                : selectedWinner
                ? 'RUN BALLOT AGAIN'
                : 'START LIVE BALLOT DRAW'}
            </span>
          </button>

          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white underline cursor-pointer py-1"
          >
            Close Balloting Machine
          </button>
        </div>
      </div>
    </div>
  );
};
