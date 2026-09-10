import React, { useState, useMemo } from 'react';
import {
  UserActiveProject,
  UserProfile,
  PaymentRecord,
  VehicleProject,
  WinnerRecord
} from '../types';
import {
  Search,
  FileSpreadsheet,
  Download,
  Phone,
  MessageCircle,
  Award,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  CircleDashed,
  Printer,
  Copy,
  Check,
  X,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';
import { getPlanTokenPrefix } from '../lib/tokenService';

interface AdminSchemeTokenRegisterProps {
  activeProjects: UserActiveProject[];
  users: UserProfile[];
  projects: VehicleProject[];
  payments: PaymentRecord[];
  winners?: WinnerRecord[];
  onDeleteActiveProject?: (tokenId: string) => void;
  currentLang?: string;
}

export const AdminSchemeTokenRegister: React.FC<AdminSchemeTokenRegisterProps> = ({
  activeProjects = [],
  users = [],
  projects = [],
  payments = [],
  winners = [],
  onDeleteActiveProject,
  currentLang = 'ur'
}) => {
  // Selected Scheme
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects.length > 0 ? projects[0].id : 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'BOOKED' | 'VACANT' | 'WINNER' | 'PENDING'>('ALL');
  const [showVacantSlots, setShowVacantSlots] = useState<boolean>(true);

  const [tokenToDelete, setTokenToDelete] = useState<{ id: string; tokenNumber: string; userName: string } | null>(null);

  // Modals
  const [selectedTokenForHistory, setSelectedTokenForHistory] = useState<{
    tokenNumber: string;
    projectTitle: string;
    userName: string;
    userId?: string;
    payments: PaymentRecord[];
  } | null>(null);

  const [selectedTokenForPass, setSelectedTokenForPass] = useState<{
    tokenNumber: string;
    project: VehicleProject | null;
    act?: UserActiveProject;
    user?: UserProfile;
    paidAmount: number;
    paidCount: number;
    status: string;
    serial?: number;
  } | null>(null);

  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 1800);
  };

  // Find currently selected scheme
  const currentProject = useMemo(() => {
    if (selectedProjectId === 'ALL') return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [selectedProjectId, projects]);

  // Derive capacity & prefix
  const schemeCapacity = useMemo(() => {
    if (!currentProject) return 1000;
    return currentProject.totalMembers || 1000;
  }, [currentProject]);

  const schemePrefix = useMemo(() => {
    if (!currentProject) {
      const year = new Date().getFullYear();
      return `TK-${year}`;
    }
    return getPlanTokenPrefix(currentProject.id, currentProject.startDate);
  }, [currentProject]);

  // Map of active tokens for the selected project
  const projectActiveTokens = useMemo(() => {
    return (activeProjects || []).filter((act) => {
      if (!currentProject) return true;
      const isIdMatch = act.projectId === currentProject.id;
      const actTitle = (act.projectTitle || '').trim().toLowerCase();
      const projTitle = (currentProject.title || '').trim().toLowerCase();
      const isTitleMatch = actTitle === projTitle || actTitle.includes(projTitle) || projTitle.includes(actTitle);
      return isIdMatch || isTitleMatch;
    });
  }, [activeProjects, currentProject]);

  // Map token numbers to active project record
  const tokenMap = useMemo(() => {
    const map = new Map<string, UserActiveProject>();
    for (const act of projectActiveTokens) {
      if (act.ticketNumber) {
        const clean = act.ticketNumber.trim().toUpperCase();
        map.set(clean, act);
      }
    }
    return map;
  }, [projectActiveTokens]);

  // Highest allotted slot number
  const maxAllottedNumber = useMemo(() => {
    let max = 0;
    for (const act of projectActiveTokens) {
      const match = String(act.ticketNumber || '').match(/(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (!isNaN(n) && n > max) max = n;
      }
    }
    return max;
  }, [projectActiveTokens]);

  // Calculate payments helper
  const getPaymentsForToken = (ticketNumber: string, projectTitle?: string) => {
    const cleanTarget = ticketNumber.trim().toUpperCase();
    return (payments || []).filter((p) => {
      if (p.status !== 'PAID') return false;
      if (projectTitle) {
        const pTitle = (p.projectName || '').trim().toLowerCase();
        const tTitle = projectTitle.trim().toLowerCase();
        if (pTitle !== tTitle && !pTitle.includes(tTitle) && !tTitle.includes(pTitle)) {
          return false;
        }
      }
      if (!p.userToken) return false;
      const tokens = p.userToken.split(',').map((t) => t.trim().toUpperCase());
      return tokens.includes(cleanTarget);
    });
  };

  // Build the unified table rows (Booked + Vacant slots up to limit)
  const rows = useMemo(() => {
    const list: Array<{
      serial: number;
      tokenNumber: string;
      status: 'BOOKED' | 'VACANT' | 'WINNER' | 'PENDING';
      act?: UserActiveProject;
      user?: UserProfile;
      payments: PaymentRecord[];
      totalPaid: number;
      paidUnits: number;
      remainingUnits: number;
      initialAdvance: number;
      initialTrx: string;
      allotmentDate: string;
    }> = [];

    // Determine how many slots to display
    const totalSlotsToGenerate = showVacantSlots
      ? schemeCapacity
      : maxAllottedNumber;

    for (let i = 1; i <= totalSlotsToGenerate; i++) {
      const paddedNum = String(i).padStart(3, '0');
      const tokenNumber = `${schemePrefix}-${paddedNum}`;

      // Check if slot is booked
      let act = tokenMap.get(tokenNumber);
      if (!act) {
        // Fallback check by raw number
        act = projectActiveTokens.find((p) => {
          const match = String(p.ticketNumber || '').match(/(\d+)$/);
          return match && parseInt(match[1], 10) === i;
        });
      }

      if (!act && !showVacantSlots) {
        continue;
      }

      let user: UserProfile | undefined = undefined;
      let tokenPayments: PaymentRecord[] = [];
      let totalPaid = 0;
      let paidUnits = 0;
      let remainingUnits = currentProject?.durationMonths || 36;
      let initialAdvance = 0;
      let initialTrx = '';
      let allotmentDate = '';
      let status: 'BOOKED' | 'VACANT' | 'WINNER' | 'PENDING' = 'VACANT';

      if (act) {
        // Match user
        user = (users || []).find(
          (u) =>
            u.id === act?.userId ||
            u.uid === act?.userId ||
            u.memberId === act?.userId ||
            (act?.userName && u.name && u.name.trim().toLowerCase() === act?.userName.trim().toLowerCase())
        );

        tokenPayments = getPaymentsForToken(act.ticketNumber, act.projectTitle);
        totalPaid = tokenPayments.reduce((acc, p) => {
          const pTokens = (p.userToken || '').split(',').map((t) => t.trim().toUpperCase()).filter(Boolean);
          const share = pTokens.length > 1 ? Math.round(p.amount / pTokens.length) : p.amount;
          return acc + share;
        }, 0);

        tokenPayments.forEach((p) => {
          const matchMonths =
            (p.installmentLabel || '').match(/Total\s*(\d+)\s*Mos/i) ||
            (p.installmentLabel || '').match(/(\d+)\s*(?:past\s*overdue\s*months|months)/i);
          if (matchMonths && matchMonths[1]) {
            paidUnits += parseInt(matchMonths[1], 10) || 1;
          } else if (act?.monthlyKist && act.monthlyKist > 0 && p.amount >= act.monthlyKist) {
            paidUnits += Math.max(1, Math.round(p.amount / act.monthlyKist));
          } else {
            paidUnits += 1;
          }
        });

        // Check if winner
        const hasWon = (winners || []).some(
          (w) =>
            (w.prizeWon.includes(act?.projectTitle || '') || (act?.ticketNumber && w.prizeWon.includes(act.ticketNumber))) &&
            (w.name === act?.userName || (act?.ticketNumber && w.prizeWon.includes(act.ticketNumber)))
        );

        if (hasWon) {
          status = 'WINNER';
          remainingUnits = 0;
        } else if (act.status === 'PENDING') {
          status = 'PENDING';
          remainingUnits = Math.max(0, (act.totalUnits || 36) - paidUnits);
        } else {
          status = 'BOOKED';
          remainingUnits = Math.max(0, (act.totalUnits || 36) - paidUnits);
        }

        // Initial advance
        if (tokenPayments.length > 0) {
          const firstPay = tokenPayments[0];
          initialAdvance = firstPay.amount;
          initialTrx = firstPay.transactionRef || 'TRX-PAID';
        }

        allotmentDate = act.nextDueOrDrawDate || new Date().toISOString().slice(0, 10);
      }

      list.push({
        serial: i,
        tokenNumber,
        status,
        act,
        user,
        payments: tokenPayments,
        totalPaid,
        paidUnits,
        remainingUnits,
        initialAdvance,
        initialTrx,
        allotmentDate
      });
    }

    // Apply search query
    return list.filter((row) => {
      if (statusFilter !== 'ALL' && row.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesToken = row.tokenNumber.toLowerCase().includes(q);
        const matchesSerial = String(row.serial) === q;
        const matchesName = row.act?.userName?.toLowerCase().includes(q) || row.user?.name?.toLowerCase().includes(q);
        const matchesPhone = row.user?.phone?.includes(q) || row.user?.phoneNumber?.includes(q);
        const matchesCnic = row.user?.cnic?.includes(q);
        const matchesCity = row.user?.city?.toLowerCase().includes(q) || row.user?.address?.toLowerCase().includes(q);
        const matchesMemberId = row.user?.memberId?.toLowerCase().includes(q);

        return matchesToken || matchesSerial || matchesName || matchesPhone || matchesCnic || matchesCity || matchesMemberId;
      }
      return true;
    });
  }, [
    showVacantSlots,
    schemeCapacity,
    maxAllottedNumber,
    schemePrefix,
    tokenMap,
    projectActiveTokens,
    currentProject,
    users,
    winners,
    statusFilter,
    searchQuery
  ]);

  // Statistics counters
  const totalBookedCount = projectActiveTokens.length;
  const totalVacantCount = Math.max(0, schemeCapacity - totalBookedCount);
  const totalRevenueCollected = useMemo(() => {
    return rows.reduce((acc, r) => acc + r.totalPaid, 0);
  }, [rows]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'S#',
      'Token Number',
      'Status',
      'Member Name',
      'Member ID',
      'Father/Husband Name',
      'Mobile No',
      'CNIC',
      'City / Address',
      'Allotment Date',
      'Advance Paid',
      'Total Paid (PKR)',
      'Installments Paid',
      'Remaining Units'
    ];

    const csvRows = rows.map((r) => [
      r.serial,
      r.tokenNumber,
      r.status,
      r.act?.userName || r.user?.name || (r.status === 'VACANT' ? 'Vacant / Available' : 'N/A'),
      r.user?.memberId || 'N/A',
      r.user?.fatherName || 'N/A',
      r.user?.phone || r.user?.phoneNumber || 'N/A',
      r.user?.cnic || 'N/A',
      `"${(r.user?.city || r.user?.address || 'N/A').replace(/"/g, '""')}"`,
      r.allotmentDate || 'N/A',
      r.initialAdvance,
      r.totalPaid,
      `${r.paidUnits}/${r.act?.totalUnits || currentProject?.durationMonths || 36}`,
      r.remainingUnits
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `Token_Register_${currentProject?.title?.replace(/\s+/g, '_') || 'All_Schemes'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Header with Scheme Switcher */}
      <div className="bg-white dark:bg-[#2d3131] p-4 sm:p-5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-[#98001b]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black font-headline text-[#181c1c] dark:text-white">
                  {currentLang === 'ur'
                    ? 'اسکیم ٹوکن رجسٹر اور آٹو الاٹمنٹ'
                    : currentLang === 'sd'
                    ? 'اسڪيم ٽوڪن رجسٽر ۽ آٽو الاٽمنٽ'
                    : 'Scheme Token Registers & Auto-Allotment'}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {currentLang === 'ur'
                    ? 'ہر سکیم کے 1 سے 1000 تک تمام سیریل ٹوکنز، کسٹمر ریکارڈ، اور ادائیگیوں کی تفصیلی فہرست'
                    : 'Complete master register of tokens (001 to 1000), member identities, and payment status'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Export */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              title="Download CSV / Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{currentLang === 'ur' ? 'ایکسل / CSV ڈاؤن لوڈ' : 'Export Excel'}</span>
            </button>
          </div>
        </div>

        {/* Scheme Selector Tabs */}
        <div className="mt-4 pt-4 border-t border-[#e0e3e2] dark:border-neutral-700">
          <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
            {currentLang === 'ur' ? 'سکیم منتخب کریں:' : 'Select Scheme Register:'}
          </p>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none hide-scrollbar">
            {projects.map((proj) => {
              const isSelected = proj.id === selectedProjectId;
              const bookedForProj = (activeProjects || []).filter(
                (a) => a.projectId === proj.id || a.projectTitle.toLowerCase().includes(proj.title.toLowerCase())
              ).length;

              return (
                <button
                  key={proj.id}
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                  }}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-[#98001b] text-white border-[#98001b] shadow-maroon'
                      : 'bg-[#f7faf9] dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-[#e0e3e2] dark:border-neutral-700 hover:bg-[#ebeeed]'
                  }`}
                >
                  <span className="truncate max-w-[180px]">{proj.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-black ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {bookedForProj} / {proj.totalMembers || 1000}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected Scheme Summary Cards */}
      {currentProject && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#2d3131] p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-[10px] font-bold uppercase">Total Capacity</span>
              <Layers className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <p className="text-xl font-black font-headline text-[#181c1c] dark:text-white font-mono">
              {schemeCapacity.toLocaleString()}
            </p>
            <p className="text-[10px] text-neutral-400 font-mono mt-0.5">Prefix: {schemePrefix}-001 to {schemeCapacity}</p>
          </div>

          <div className="bg-white dark:bg-[#2d3131] p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-[10px] font-bold uppercase">Booked & Active</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-black font-headline text-emerald-600 font-mono">
              {totalBookedCount}
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              {schemeCapacity > 0 ? Math.round((totalBookedCount / schemeCapacity) * 100) : 0}% Filled
            </p>
          </div>

          <div className="bg-white dark:bg-[#2d3131] p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-[10px] font-bold uppercase">Available / Vacant</span>
              <CircleDashed className="w-3.5 h-3.5 text-neutral-400" />
            </div>
            <p className="text-xl font-black font-headline text-neutral-600 dark:text-neutral-300 font-mono">
              {totalVacantCount}
            </p>
            <p className="text-[10px] text-blue-600 font-mono font-bold mt-0.5">
              Next: {schemePrefix}-{String(maxAllottedNumber + 1).padStart(3, '0')}
            </p>
          </div>

          <div className="bg-white dark:bg-[#2d3131] p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-[10px] font-bold uppercase">Revenue Verified</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="text-lg sm:text-xl font-black font-headline text-[#98001b] dark:text-rose-400 font-mono">
              PKR {totalRevenueCollected.toLocaleString()}
            </p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{currentProject.durationMonths} Mos Plan</p>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-[#2d3131] p-4 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={
                currentLang === 'ur'
                  ? 'ٹوکن نمبر، ممبر کا نام، فون نمبر، شناختی کارڈ یا شہر سے تلاش کریں...'
                  : 'Search by Token No, Member Name, Mobile, CNIC, City...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#f8faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl text-xs text-[#181c1c] dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#98001b]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(
              [
                { id: 'ALL', label: 'All Slots' },
                { id: 'BOOKED', label: 'Booked' },
                { id: 'VACANT', label: 'Vacant' },
                { id: 'PENDING', label: 'Pending' },
                { id: 'WINNER', label: 'Winners' }
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${
                  statusFilter === st.id
                    ? 'bg-[#181c1c] text-white dark:bg-white dark:text-[#181c1c]'
                    : 'bg-[#f0f3f2] dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-[#e4e7e6]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Toggle Vacant Slots Switch */}
          <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-neutral-200 dark:border-neutral-700">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-neutral-600 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={showVacantSlots}
                onChange={(e) => setShowVacantSlots(e.target.checked)}
                className="w-4 h-4 text-[#98001b] rounded focus:ring-[#98001b]"
              />
              <span>{currentLang === 'ur' ? 'خالی سلاٹس (001 تا 1000) دکھائیں' : 'Show Vacant Slots'}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Main Register Table */}
      <div className="bg-white dark:bg-[#2d3131] rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[650px] scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead className="sticky top-0 z-10 bg-[#f1f4f3] dark:bg-neutral-800 border-b border-[#e0e3e2] dark:border-neutral-700 shadow-xs">
              <tr>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">S#</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Token Number</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Status</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Member Name & ID</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Father / Husband</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Mobile / WhatsApp</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">CNIC No</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">City / Address</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Allotment Date</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Advance Paid</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Total Paid</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Remaining</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e2] dark:divide-neutral-700 bg-white dark:bg-[#2d3131]">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="p-8 text-center text-xs text-neutral-400">
                    No token records found matching your filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const isBooked = row.status === 'BOOKED' || row.status === 'WINNER' || row.status === 'PENDING';
                  const phoneNum = row.user?.phone || row.user?.phoneNumber || '';

                  return (
                    <tr
                      key={row.tokenNumber}
                      className={`transition-colors ${
                        row.status === 'WINNER'
                          ? 'bg-amber-50/40 dark:bg-amber-950/20'
                          : row.status === 'PENDING'
                          ? 'bg-yellow-50/40 dark:bg-yellow-950/20'
                          : isBooked
                          ? 'hover:bg-[#fbfcfc] dark:hover:bg-neutral-800/60'
                          : 'opacity-65 hover:opacity-100 bg-[#fdfefe] dark:bg-neutral-900/30'
                      }`}
                    >
                      {/* 1. S# */}
                      <td className="p-3 text-xs font-mono font-bold text-neutral-500">
                        {row.serial}
                      </td>

                      {/* 2. Token Number */}
                      <td className="p-3 text-xs font-mono font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md border font-black ${
                              row.status === 'WINNER'
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : isBooked
                                ? 'bg-rose-50 dark:bg-rose-950/50 text-[#98001b] border-rose-200 dark:border-rose-900'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-neutral-700'
                            }`}
                          >
                            {row.tokenNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(row.tokenNumber)}
                            className="text-neutral-400 hover:text-neutral-600 cursor-pointer p-0.5"
                            title="Copy Token"
                          >
                            {copiedToken === row.tokenNumber ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 3. Status */}
                      <td className="p-3 text-xs whitespace-nowrap">
                        {row.status === 'WINNER' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                            <Award className="w-3 h-3 text-amber-600" />
                            Winner (Waived)
                          </span>
                        ) : row.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800 border border-yellow-300">
                            <Clock className="w-3 h-3 text-yellow-600" />
                            Pending Approval
                          </span>
                        ) : row.status === 'BOOKED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Booked & Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                            <CircleDashed className="w-3 h-3" />
                            Available / Vacant
                          </span>
                        )}
                      </td>

                      {/* 4. Member Name & ID */}
                      <td className="p-3 text-xs whitespace-nowrap">
                        {isBooked ? (
                          <div>
                            <p className="font-bold text-[#181c1c] dark:text-white">
                              {row.act?.userName || row.user?.name || 'Member'}
                            </p>
                            {row.user?.memberId && (
                              <p className="text-[10px] font-mono text-neutral-400">
                                ID: {row.user.memberId}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs italic">-- Vacant Slot --</span>
                        )}
                      </td>

                      {/* 5. Father / Husband */}
                      <td className="p-3 text-xs text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                        {row.user?.fatherName || (isBooked ? 'S/O Guardian' : '--')}
                      </td>

                      {/* 6. Mobile / WhatsApp */}
                      <td className="p-3 text-xs font-mono whitespace-nowrap">
                        {phoneNum ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${phoneNum}`}
                              className="text-blue-600 hover:underline font-bold flex items-center gap-1"
                              title="Call Member"
                            >
                              <Phone className="w-3 h-3" />
                              {phoneNum}
                            </a>
                            <a
                              href={`https://wa.me/${phoneNum.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-600 hover:text-emerald-700"
                              title="WhatsApp Member"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-neutral-400">--</span>
                        )}
                      </td>

                      {/* 7. CNIC No */}
                      <td className="p-3 text-xs font-mono text-neutral-600 dark:text-neutral-300 whitespace-nowrap">
                        {row.user?.cnic || (isBooked ? 'Verified in App' : '--')}
                      </td>

                      {/* 8. City / Address */}
                      <td className="p-3 text-xs text-neutral-600 dark:text-neutral-300 max-w-[150px] truncate" title={row.user?.city || row.user?.address || ''}>
                        {row.user?.city || row.user?.address || (isBooked ? 'Sindh, Pakistan' : '--')}
                      </td>

                      {/* 9. Allotment Date */}
                      <td className="p-3 text-xs font-mono text-neutral-500 whitespace-nowrap">
                        {row.allotmentDate || (isBooked ? 'Active' : '--')}
                      </td>

                      {/* 10. Advance Paid */}
                      <td className="p-3 text-xs font-mono whitespace-nowrap">
                        {row.initialAdvance > 0 ? (
                          <div>
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">
                              PKR {row.initialAdvance.toLocaleString()}
                            </span>
                            {row.initialTrx && (
                              <span className="block text-[9px] text-neutral-400">
                                {row.initialTrx}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-neutral-400">PKR 0</span>
                        )}
                      </td>

                      {/* 11. Total Paid & Installments */}
                      <td className="p-3 text-xs font-mono whitespace-nowrap">
                        {isBooked ? (
                          <div>
                            <span className="font-black text-emerald-600 dark:text-emerald-400">
                              PKR {row.totalPaid.toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-neutral-500 font-sans">
                              {row.paidUnits} / {row.act?.totalUnits || currentProject?.durationMonths || 36} Units
                            </span>
                          </div>
                        ) : (
                          <span className="text-neutral-400">PKR 0</span>
                        )}
                      </td>

                      {/* 12. Remaining */}
                      <td className="p-3 text-xs font-mono whitespace-nowrap">
                        {isBooked ? (
                          <span
                            className={`font-bold ${
                              row.remainingUnits === 0
                                ? 'text-emerald-600'
                                : 'text-neutral-700 dark:text-neutral-300'
                            }`}
                          >
                            {row.remainingUnits} Left
                          </span>
                        ) : (
                          <span className="text-neutral-400">--</span>
                        )}
                      </td>

                      {/* 13. Actions */}
                      <td className="p-3 text-xs text-center whitespace-nowrap">
                        {isBooked ? (
                          <div className="flex items-center justify-center gap-1.5">
                            {/* View History */}
                            <button
                              onClick={() => {
                                setSelectedTokenForHistory({
                                  tokenNumber: row.tokenNumber,
                                  projectTitle: row.act?.projectTitle || currentProject?.title || 'Scheme',
                                  userName: row.act?.userName || row.user?.name || 'Member',
                                  userId: row.act?.userId,
                                  payments: row.payments
                                });
                              }}
                              className="p-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 cursor-pointer"
                              title="View Payment History / Statement"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* View Official Pass */}
                            {currentProject && (
                              <button
                                onClick={() => {
                                  setSelectedTokenForPass({
                                    tokenNumber: row.tokenNumber,
                                    project: currentProject,
                                    act: row.act,
                                    user: row.user,
                                    paidAmount: row.totalPaid,
                                    paidCount: row.paidUnits,
                                    status: row.status,
                                    serial: row.serial
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-[#98001b] cursor-pointer"
                                title="Print / View Token Pass"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Delete Active Project Allotment */}
                            {onDeleteActiveProject && row.act?.id && (
                              <button
                                onClick={() => {
                                  setTokenToDelete({
                                    id: row.act!.id,
                                    tokenNumber: row.tokenNumber,
                                    userName: row.act?.userName || 'User'
                                  });
                                }}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                                title="Release Slot"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-neutral-400 font-mono">Available</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Payment History / Statement */}
      {selectedTokenForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#2d3131] rounded-2xl max-w-lg w-full p-5 border border-[#e0e3e2] dark:border-neutral-700 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e0e3e2] dark:border-neutral-700 pb-3">
              <div>
                <h4 className="font-bold text-sm text-[#181c1c] dark:text-white flex items-center gap-2">
                  <span className="bg-rose-50 text-[#98001b] px-2 py-0.5 rounded font-mono font-bold">
                    {selectedTokenForHistory.tokenNumber}
                  </span>
                  <span>Payment History</span>
                </h4>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedTokenForHistory.userName} &bull; {selectedTokenForHistory.projectTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedTokenForHistory(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 divide-y divide-neutral-100 dark:divide-neutral-800">
              {selectedTokenForHistory.payments.length === 0 ? (
                <div className="text-center py-6 text-xs text-neutral-400">
                  No verified payments recorded for this specific token yet.
                </div>
              ) : (
                selectedTokenForHistory.payments.map((p, idx) => (
                  <div key={p.id || idx} className="pt-2 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[#181c1c] dark:text-white">
                        {p.installmentLabel || 'Installment Payment'}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        {p.date} &bull; TRX: {p.transactionRef || 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-emerald-600 font-mono">
                        PKR {p.amount.toLocaleString()}
                      </p>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                        VERIFIED
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-[#e0e3e2] dark:border-neutral-700 flex justify-end">
              <button
                onClick={() => setSelectedTokenForHistory(null)}
                className="bg-[#181c1c] dark:bg-white text-white dark:text-[#181c1c] text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Official Token Certificate / Allotment Pass */}
      {selectedTokenForPass && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#2d3131] rounded-2xl max-w-md w-full p-5 border border-[#e0e3e2] dark:border-neutral-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e0e3e2] dark:border-neutral-700 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="font-bold text-sm text-[#181c1c] dark:text-white">
                  Official Token Allotment Pass
                </h4>
              </div>
              <button
                onClick={() => setSelectedTokenForPass(null)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pass Body */}
            <div className="bg-[#fcf8f2] dark:bg-neutral-900 border-2 border-dashed border-[#e9c176] rounded-2xl p-4 text-center space-y-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase text-[#785a1a] tracking-wider">
                  Apni Sawari Official Scheme
                </p>
                <h3 className="text-base font-black text-[#98001b]">
                  {selectedTokenForPass.project.title}
                </h3>
              </div>

              {/* Big Token Badge */}
              <div className="py-2.5 px-4 bg-white dark:bg-neutral-800 rounded-xl border border-[#e9c176] shadow-xs inline-block">
                <p className="text-[10px] text-neutral-400 uppercase font-bold">Allotted Token Number</p>
                <p className="text-2xl font-black font-mono text-[#98001b] tracking-wider">
                  {selectedTokenForPass.tokenNumber}
                </p>
              </div>

              {/* Member Details */}
              <div className="text-left bg-white/70 dark:bg-neutral-800/70 p-3 rounded-xl border border-[#e9c176]/50 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Member:</span>
                  <strong className="text-neutral-800 dark:text-white uppercase">
                    {selectedTokenForPass.act?.userName || selectedTokenForPass.user?.name || 'Valued Member'}
                  </strong>
                </div>
                {selectedTokenForPass.serial && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Register No:</span>
                    <strong className="font-mono text-[#98001b]">
                      {selectedTokenForPass.serial.toString().padStart(2, '0')}
                    </strong>
                  </div>
                )}
                {selectedTokenForPass.user?.cnic && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">CNIC:</span>
                    <strong className="font-mono">{selectedTokenForPass.user.cnic}</strong>
                  </div>
                )}
                {selectedTokenForPass.user?.phone && (
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Phone:</span>
                    <strong className="font-mono">{selectedTokenForPass.user.phone}</strong>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-neutral-200 dark:border-neutral-700">
                  <span className="text-neutral-500">Total Paid:</span>
                  <strong className="font-mono text-emerald-600">
                    PKR {selectedTokenForPass.paidAmount.toLocaleString()} ({selectedTokenForPass.paidCount} Units)
                  </strong>
                </div>
              </div>

              <p className="text-[10px] text-neutral-400 italic">
                Official Computerized Token Registry Entry &bull; Valid for Lucky Draw
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-[#98001b] hover:bg-[#be1e2d] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-maroon"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
              <button
                onClick={() => setSelectedTokenForPass(null)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 dark:text-neutral-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE REGISTRATION CONFIRMATION */}
      {tokenToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h4 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                Release & Delete Token?
              </h4>
              <p className="font-urdu text-xs text-neutral-600 dark:text-neutral-300">
                Are you sure you want to release <strong>Token {tokenToDelete.tokenNumber}</strong> for <strong>{tokenToDelete.userName}</strong>? This slot will become vacant.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTokenToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100 cursor-pointer dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteActiveProject) {
                    onDeleteActiveProject(tokenToDelete.id);
                  }
                  setTokenToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
