import React, { useState, useMemo, useDeferredValue, useCallback } from 'react';
import {
  User,
  Phone,
  CreditCard,
  Mail,
  MapPin,
  Lock,
  Edit,
  Trash2,
  Snowflake,
  Play,
  KeyRound,
  History,
  ChevronDown,
  ChevronUp,
  Search,
  Plus,
  CheckCircle2,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { UserProfile, PaymentRecord, VehicleProject } from '../types';

interface AdminCustomersSectionProps {
  users: UserProfile[];
  payments: PaymentRecord[];
  projects: VehicleProject[];
  onAddUser: () => void;
  onEditUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (user: UserProfile) => void;
  onViewSlip: (url: string, title: string) => void;
}

// ------------------------------------------------------------------
// Memoized Single Customer Card Component to Prevent Cascade Re-renders
// ------------------------------------------------------------------
interface CustomerCardProps {
  member: UserProfile;
  userPayments: PaymentRecord[];
  totalPaid: number;
  isFrozen: boolean;
  isHistoryExpanded: boolean;
  onToggleExpand: () => void;
  onToggleFreeze: (user: UserProfile) => void;
  onEditUser: (user: UserProfile) => void;
  onRequestDelete: (user: UserProfile) => void;
  onRequestPasswordChange: (user: UserProfile) => void;
  onPreviewPhoto: (url: string) => void;
  onViewSlip: (url: string, title: string) => void;
}

const CustomerCard = React.memo<CustomerCardProps>(({
  member,
  userPayments,
  totalPaid,
  isFrozen,
  isHistoryExpanded,
  onToggleExpand,
  onToggleFreeze,
  onEditUser,
  onRequestDelete,
  onRequestPasswordChange,
  onPreviewPhoto,
  onViewSlip
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#2d3131] rounded-3xl border shadow-xs transition-all overflow-hidden ${
        isFrozen
          ? 'border-red-300 dark:border-red-900 bg-red-50/20'
          : 'border-[#e0e3e2] dark:border-neutral-700'
      }`}
    >
      {/* Member Card Header */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left: Avatar & Basic Details */}
        <div className="flex items-start gap-3.5">
          {/* Profile Photo Avatar */}
          <div
            onClick={() => member.avatarUrl && onPreviewPhoto(member.avatarUrl)}
            className={`w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 shadow-xs cursor-pointer flex items-center justify-center ${
              member.avatarUrl
                ? 'border-[#98001b]'
                : 'bg-neutral-100 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600'
            }`}
            title={member.avatarUrl ? 'Click to view full photo' : 'No photo uploaded'}
          >
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                width={56}
                height={56}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:scale-110 transition-transform"
              />
            ) : (
              <User className="w-7 h-7 text-neutral-400" />
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-['Montserrat'] font-black text-base text-[#181c1c] dark:text-white">
                {member.name}
              </h4>
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fed488]/40 text-[#775a19] dark:text-[#fed488] border border-[#fed488]">
                {member.memberId || 'NO-TOKEN'}
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isFrozen
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {isFrozen ? <Snowflake className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                <span>{isFrozen ? 'FROZEN / ' : 'ACTIVE / '}</span>
              </span>
            </div>

            {/* Contact & Personal Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#98001b]" />
                <span className="font-mono">{member.phone || member.phoneNumber || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#98001b]" />
                <span className="font-mono">{member.cnic || 'N/A'}</span>
              </div>
              {member.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#98001b]" />
                  <span>{member.email}</span>
                </div>
              )}
              {member.address && (
                <div className="flex items-center gap-1.5 col-span-full">
                  <MapPin className="w-3.5 h-3.5 text-[#98001b] shrink-0" />
                  <span className="font-urdu text-[11px] text-neutral-700 dark:text-neutral-200">
                    {member.address}
                  </span>
                </div>
              )}
            </div>

            {/* Password Info */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-neutral-500 font-bold uppercase flex items-center gap-1">
                <Lock className="w-3 h-3 text-neutral-400" />
                Pass:
              </span>
              <span className="font-mono text-xs font-bold text-[#181c1c] dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                {member.password || '••••••'}
              </span>
              <button
                type="button"
                onClick={() => onRequestPasswordChange(member)}
                className="text-[11px] text-[#98001b] font-bold hover:underline cursor-pointer ml-1"
              >
                Change / Reset
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-neutral-100 dark:border-neutral-700">
          {/* Freeze / Unfreeze Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleFreeze(member)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all ${
              isFrozen
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300'
            }`}
            title={isFrozen ? 'Unfreeze this account' : 'Freeze this account'}
          >
            {isFrozen ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Unfreeze</span>
              </>
            ) : (
              <>
                <Snowflake className="w-3.5 h-3.5" />
                <span>Freeze Account</span>
              </>
            )}
          </button>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={() => onEditUser(member)}
            className="px-3 py-2 rounded-xl bg-[#f7faf9] hover:bg-[#ebeeed] dark:bg-neutral-800 text-[#181c1c] dark:text-white font-bold text-xs border border-[#e0e3e2] dark:border-neutral-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5 text-[#98001b]" />
            <span>Edit</span>
          </button>

          {/* Delete Member Button */}
          <button
            type="button"
            onClick={() => onRequestDelete(member)}
            className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300 font-bold text-xs border border-red-200 flex items-center gap-1 cursor-pointer"
            title="Delete Member"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Member Summary Strip & Installment History Accordion Button */}
      <div className="bg-[#f7faf9] dark:bg-neutral-800/80 px-4 py-2.5 border-t border-[#e0e3e2] dark:border-neutral-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs">
          <div>
            <span className="text-neutral-500 text-[10px] block uppercase font-bold">Total Paid</span>
            <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
              PKR {totalPaid.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-neutral-500 text-[10px] block uppercase font-bold">Slips Count</span>
            <span className="font-mono font-bold text-[#181c1c] dark:text-white">
              {userPayments.length} Slips
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExpand}
          className="bg-white dark:bg-neutral-700 border border-[#e0e3e2] dark:border-neutral-600 text-[#98001b] dark:text-[#ffb3b0] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-neutral-50 cursor-pointer shadow-xs"
        >
          <History className="w-3.5 h-3.5" />
          <span>Customer Installment History</span>
          {isHistoryExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Customer Installment History */}
      {isHistoryExpanded && (
        <div className="p-4 bg-white dark:bg-[#242929] border-t border-[#e0e3e2] dark:border-neutral-700 space-y-3 animate-in fade-in duration-150">
          <div className="flex justify-between items-center">
            <h5 className="font-['Montserrat'] font-bold text-xs uppercase text-[#181c1c] dark:text-white flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#98001b]" />
              <span>All Payment Installments for {member.name}</span>
            </h5>
            <span className="text-[11px] text-neutral-500 font-urdu">
               <strong>{userPayments.length}</strong>   
            </span>
          </div>

          {userPayments.length === 0 ? (
            <div className="bg-[#f7faf9] dark:bg-neutral-800 p-4 rounded-2xl text-center text-xs text-neutral-500 font-urdu">
                            
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-[#e0e3e2] dark:border-neutral-700">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#f1f4f3] dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-bold uppercase text-[10px]">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Scheme & Label</th>
                    <th className="p-2.5">Receiving Account</th>
                    <th className="p-2.5">Trx Ref</th>
                    <th className="p-2.5 text-right">Amount (PKR)</th>
                    <th className="p-2.5 text-center">Status</th>
                    <th className="p-2.5 text-center">Slip</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0e3e2] dark:divide-neutral-700">
                  {userPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="p-2.5 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                        {p.date}
                      </td>
                      <td className="p-2.5">
                        <span className="font-bold text-[#181c1c] dark:text-white">{p.projectName}</span>
                        <span className="block text-[10px] text-neutral-500">{p.installmentLabel}</span>
                      </td>
                      <td className="p-2.5 font-semibold text-[11px] text-[#775a19] dark:text-[#fed488]">
                        {p.paymentMethod || 'Cash Counter'}
                      </td>
                      <td className="p-2.5 font-mono text-[10px] text-neutral-500">
                        {p.transactionRef}
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-xs text-[#98001b] dark:text-[#ffb3b0]">
                        PKR {p.amount.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            p.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'UNDER_REVIEW'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-center">
                        {p.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => onViewSlip(p.receiptUrl!, `${p.userName} (${p.projectName})`)}
                            className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                            title="View Slip Screenshot"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-neutral-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

// ------------------------------------------------------------------
// Main Admin Customers Directory Component
// ------------------------------------------------------------------
export const AdminCustomersSection: React.FC<AdminCustomersSectionProps> = ({
  users,
  payments,
  projects,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onUpdateUser,
  onViewSlip
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'frozen'>('all');
  const [expandedUserHistoryId, setExpandedUserHistoryId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Quick Password Change Modal
  const [passwordModalUser, setPasswordModalUser] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [passwordModalSuccess, setPasswordModalSuccess] = useState(false);

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);

  // Large Photo Preview Modal
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);

  // Pre-index payments by user for O(1) lookups instead of O(N) in render
  const paymentsByUserMap = useMemo(() => {
    const map = new Map<string, PaymentRecord[]>();
    for (const p of payments) {
      if (p.userId) {
        const list = map.get(p.userId) || [];
        list.push(p);
        map.set(p.userId, list);
      }
      if (p.userToken) {
        const list = map.get(p.userToken) || [];
        list.push(p);
        map.set(p.userToken, list);
      }
      if (p.userName) {
        const lowerName = p.userName.toLowerCase();
        const list = map.get(lowerName) || [];
        list.push(p);
        map.set(lowerName, list);
      }
    }
    return map;
  }, [payments]);

  // Filter users with memoization and non-blocking deferred query
  const approvedUsers = useMemo(() => (users || []).filter(u => u.account_status !== 'pending'), [users]);

  const filteredUsers = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();

    return approvedUsers.filter((u) => {
      // Status Filter
      if (statusFilter === 'active' && u.account_status === 'frozen') return false;
      if (statusFilter === 'frozen' && u.account_status !== 'frozen') return false;

      // Search Query
      if (q) {
        const name = (u.name || '').toLowerCase();
        const memberId = (u.memberId || '').toLowerCase();
        const phone = (u.phone || u.phoneNumber || '').toLowerCase();
        const cnic = (u.cnic || '').toLowerCase();
        const email = (u.email || '').toLowerCase();
        const addr = (u.address || '').toLowerCase();
        return (
          name.includes(q) ||
          memberId.includes(q) ||
          phone.includes(q) ||
          cnic.includes(q) ||
          email.includes(q) ||
          addr.includes(q)
        );
      }
      return true;
    });
  }, [users, statusFilter, deferredSearch]);

  // Paginated Slicing
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedUsers = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, effectivePage, pageSize]);

  // Handlers with useCallback
  const handleToggleFreeze = useCallback((user: UserProfile) => {
    const isCurrentlyFrozen = user.account_status === 'frozen';
    const updated: UserProfile = {
      ...user,
      account_status: isCurrentlyFrozen ? 'active' : 'frozen'
    };
    onUpdateUser(updated);
  }, [onUpdateUser]);

  const handleSavePassword = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPasswordInput.trim() || newPasswordInput.length < 6) return;

    const updated: UserProfile = {
      ...passwordModalUser,
      password: newPasswordInput.trim()
    };
    onUpdateUser(updated);
    setPasswordModalSuccess(true);
    setTimeout(() => {
      setPasswordModalSuccess(false);
      setPasswordModalUser(null);
      setNewPasswordInput('');
    }, 1200);
  }, [passwordModalUser, newPasswordInput, onUpdateUser]);

  const getUserPayments = useCallback((user: UserProfile): PaymentRecord[] => {
    const set = new Set<PaymentRecord>();
    if (user.id && paymentsByUserMap.has(user.id)) {
      paymentsByUserMap.get(user.id)!.forEach(p => set.add(p));
    }
    if (user.memberId && paymentsByUserMap.has(user.memberId)) {
      paymentsByUserMap.get(user.memberId)!.forEach(p => set.add(p));
    }
    if (user.name && paymentsByUserMap.has(user.name.toLowerCase())) {
      paymentsByUserMap.get(user.name.toLowerCase())!.forEach(p => set.add(p));
    }
    return Array.from(set);
  }, [paymentsByUserMap]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#98001b]/10 text-[#98001b] flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase tracking-wider">
              Registered Customers & Members Directory ({approvedUsers.length})
            </h3>
          </div>
          <p className="text-xs text-neutral-500 font-urdu mt-0.5">
                         
          </p>
        </div>

        <button
          type="button"
          onClick={onAddUser}
          className="bg-[#98001b] hover:bg-[#be1e2d] text-white px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Member</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#2d3131] p-3 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by Name, Token (TK-...), Phone, CNIC, Address..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl text-xs font-semibold text-[#181c1c] dark:text-white outline-none focus:border-[#98001b]"
          />
        </div>

        <div className="flex items-center gap-1 bg-[#f1f4f3] dark:bg-neutral-800 p-1 rounded-xl border border-[#e0e3e2] dark:border-neutral-700">
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-neutral-700 text-[#181c1c] dark:text-white shadow-xs'
                : 'text-neutral-500'
            }`}
          >
            All ({approvedUsers.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('active');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-500'
            }`}
          >
            Active ({approvedUsers.filter((u) => u.account_status !== 'frozen').length})
          </button>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('frozen');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === 'frozen'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-neutral-500'
            }`}
          >
            Frozen ({approvedUsers.filter((u) => u.account_status === 'frozen').length})
          </button>
        </div>
      </div>

      {/* Customer List */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-[#2d3131] p-8 rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 text-center font-urdu text-neutral-500 space-y-1">
          <p className="font-bold text-sm">    </p>
          <p className="text-xs">       </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedUsers.map((member) => {
            const userPayments = getUserPayments(member);
            const totalPaid = userPayments
              .filter((p) => p.status === 'PAID')
              .reduce((sum, p) => sum + p.amount, 0);
            const isFrozen = member.account_status === 'frozen';
            const memberKey = member.id || member.uid || member.memberId || `u-${Math.random()}`;
            const isHistoryExpanded = expandedUserHistoryId === memberKey;

            return (
              <CustomerCard
                key={memberKey}
                member={member}
                userPayments={userPayments}
                totalPaid={totalPaid}
                isFrozen={isFrozen}
                isHistoryExpanded={isHistoryExpanded}
                onToggleExpand={() => setExpandedUserHistoryId(isHistoryExpanded ? null : memberKey)}
                onToggleFreeze={handleToggleFreeze}
                onEditUser={onEditUser}
                onRequestDelete={setUserToDelete}
                onRequestPasswordChange={(m) => {
                  setPasswordModalUser(m);
                  setNewPasswordInput(m.password || '');
                }}
                onPreviewPhoto={setPhotoPreviewUrl}
                onViewSlip={onViewSlip}
              />
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredUsers.length > pageSize && (
        <div className="bg-white dark:bg-[#2d3131] p-3.5 rounded-2xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-neutral-500 dark:text-neutral-400 font-medium">
            Showing <strong className="text-[#181c1c] dark:text-white font-mono">{(effectivePage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-[#181c1c] dark:text-white font-mono">
              {Math.min(effectivePage * pageSize, filteredUsers.length)}
            </strong>{' '}
            of <strong className="text-[#181c1c] dark:text-white font-mono">{filteredUsers.length}</strong> members
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={effectivePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-[#e0e3e2] dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-mono font-bold px-2 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              Page {effectivePage} / {totalPages}
            </span>

            <button
              type="button"
              disabled={effectivePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-[#e0e3e2] dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CHANGE / RESET PASSWORD MODAL */}
      {/* ========================================================= */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-[#e0e3e2] dark:border-neutral-700 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#98001b]" />
                <h3 className="font-['Montserrat'] font-bold text-sm text-[#181c1c] dark:text-white">
                  Change Member Password
                </h3>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="text-neutral-400 hover:text-neutral-800 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-neutral-600 dark:text-neutral-300">
              Set new login password for <strong>{passwordModalUser.name}</strong> ({passwordModalUser.memberId}):
            </div>

            {passwordModalSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded-xl text-xs font-bold font-urdu flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>         !</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 uppercase mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:border-[#98001b] outline-none text-[#181c1c] dark:text-white"
                  required
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#e0e3e2] text-xs font-bold hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#98001b] hover:bg-[#be1e2d] text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: DELETE USER CONFIRMATION MODAL */}
      {/* ========================================================= */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1e2323] w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="font-['Montserrat'] font-black text-sm text-[#181c1c] dark:text-white uppercase">
                Delete Member Account?
              </h4>
              <p className="font-urdu text-xs text-neutral-600 dark:text-neutral-300">
                   <strong>{userToDelete.name}</strong> ({userToDelete.memberId})         
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(userToDelete.id || userToDelete.uid || userToDelete.memberId);
                  setUserToDelete(null);
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: LARGE PROFILE PHOTO PREVIEW MODAL */}
      {/* ========================================================= */}
      {photoPreviewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPhotoPreviewUrl(null)}
        >
          <div
            className="bg-white dark:bg-[#1e2323] max-w-lg w-full rounded-3xl p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center">
              <span className="font-['Montserrat'] font-bold text-xs text-neutral-700 dark:text-neutral-300 uppercase">
                Member Profile Picture
              </span>
              <button
                onClick={() => setPhotoPreviewUrl(null)}
                className="text-neutral-400 hover:text-neutral-800 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <img
                src={photoPreviewUrl}
                alt="Member Profile Large"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
