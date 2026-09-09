import React, { useState } from 'react';
import { UserActiveProject, UserProfile, PaymentRecord, VehicleProject } from '../types';
import { Search, FileSpreadsheet, Calendar, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface AdminTokenLedgerSectionProps {
  activeProjects: UserActiveProject[];
  users: UserProfile[];
  projects: VehicleProject[];
  payments: PaymentRecord[];
  onDeleteActiveProject?: (tokenId: string) => void;
}

export const AdminTokenLedgerSection: React.FC<AdminTokenLedgerSectionProps> = ({
  activeProjects,
  users,
  projects,
  payments,
  onDeleteActiveProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [expandedToken, setExpandedToken] = useState<string | null>(null);
  const [tokenToDelete, setTokenToDelete] = useState<string | null>(null);

  const filteredProjects = (activeProjects || []).filter(act => {
    if (selectedProjectId !== 'ALL' && act.projectId !== selectedProjectId) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const user = (users || []).find(u => u.id === act.userId || u.uid === act.userId);
      return (
        act.ticketNumber?.toLowerCase().includes(q) ||
        act.userName?.toLowerCase().includes(q) ||
        user?.cnic?.includes(q) ||
        user?.phone?.includes(q) ||
        user?.phoneNumber?.includes(q)
      );
    }
    return true;
  });

  const getFilteredPayments = (ticketNumber: string) => {
    let tokenPayments = (payments || []).filter(p => p.userToken === ticketNumber && p.status === 'PAID');
    
    if (startDate) {
      const sDate = new Date(startDate);
      tokenPayments = tokenPayments.filter(p => new Date(p.date) >= sDate);
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      tokenPayments = tokenPayments.filter(p => new Date(p.date) <= eDate);
    }
    
    // Sort by date ascending
    return tokenPayments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <h3 className="font-headline font-bold text-xs text-[#181c1c] dark:text-white uppercase flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-[#98001b]" />
          Token & Installment Ledger
        </h3>
      </div>

      <div className="bg-white dark:bg-[#2d3131] p-4 rounded-3xl border border-[#e0e3e2] dark:border-neutral-700 shadow-xs space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search Token/Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
            />
          </div>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl px-3 py-2 text-xs font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b] w-full"
          >
            <option value="ALL">All Schemes</option>
            {(projects || []).map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#f7faf9] dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-neutral-800 dark:text-white outline-none focus:border-[#98001b]"
            />
          </div>
        </div>

        {/* Ledger Table (Scrollable) */}
        <div className="overflow-x-auto rounded-xl border border-[#e0e3e2] dark:border-neutral-700">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#f1f4f3] dark:bg-neutral-800 border-b border-[#e0e3e2] dark:border-neutral-700">
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">S.No</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Token No</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Member Name</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">CNIC</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Mobile No</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap">Scheme</th>
                <th className="p-3 text-[10px] font-bold text-neutral-500 uppercase whitespace-nowrap text-center">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e0e3e2] dark:divide-neutral-700 bg-white dark:bg-[#2d3131]">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-neutral-400">
                    No records found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredProjects.map((act, index) => {
                  const user = (users || []).find(u => u.id === act.userId || u.uid === act.userId);
                  const isExpanded = expandedToken === act.id;
                  const tokenPayments = getFilteredPayments(act.ticketNumber);
                  
                  return (
                    <React.Fragment key={act.id}>
                      <tr 
                        className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        onClick={() => setExpandedToken(isExpanded ? null : act.id)}
                      >
                        <td className="p-3 text-xs text-neutral-600 dark:text-neutral-300 font-medium">{index + 1}</td>
                        <td className="p-3 text-xs text-[#98001b] font-bold font-mono whitespace-nowrap">{act.ticketNumber}</td>
                        <td className="p-3 text-xs text-[#181c1c] dark:text-white font-bold whitespace-nowrap">{act.userName || user?.name || 'N/A'}</td>
                        <td className="p-3 text-xs text-neutral-600 dark:text-neutral-300 font-mono whitespace-nowrap">{user?.cnic || 'N/A'}</td>
                        <td className="p-3 text-xs text-neutral-600 dark:text-neutral-300 font-mono whitespace-nowrap">{user?.phone || user?.phoneNumber || 'N/A'}</td>
                        <td className="p-3 text-xs text-neutral-600 dark:text-neutral-300 max-w-[150px] truncate" title={act.projectTitle}>
                          {act.projectTitle}
                        </td>
                        <td className="p-3 text-xs text-center font-bold">
                          <div className="flex items-center justify-center gap-3">
                            <button className="text-[#98001b] flex items-center gap-1">
                              {tokenPayments.length} Payments
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTokenToDelete(act.id);
                              }}
                              className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg transition-colors"
                              title="Delete Token"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan={7} className="p-0 bg-neutral-50 dark:bg-neutral-800 border-b border-[#e0e3e2] dark:border-neutral-700">
                            <div className="p-4 border-l-2 border-[#98001b] m-2 rounded-r-xl bg-white dark:bg-[#1e2323] shadow-inner">
                              <h4 className="text-xs font-bold text-[#181c1c] dark:text-white uppercase mb-3">
                                Payment History ({startDate || endDate ? 'Filtered Dates' : 'All Time'})
                              </h4>
                              {tokenPayments.length === 0 ? (
                                <p className="text-xs text-neutral-500">No paid installments found for this period.</p>
                              ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {tokenPayments.map((p, idx) => (
                                    <div key={p.id} className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 p-2.5 rounded-xl">
                                      <div className="flex justify-between items-start mb-1">
                                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-800/50 px-1.5 py-0.5 rounded">
                                          #{idx + 1}
                                        </span>
                                        <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400">
                                          {p.date}
                                        </span>
                                      </div>
                                      <p className="text-xs font-bold text-[#181c1c] dark:text-white mt-1">
                                        PKR {p.amount?.toLocaleString() || 0}
                                      </p>
                                      <p className="text-[10px] text-neutral-500 truncate mt-0.5" title={p.installmentLabel}>
                                        {p.installmentLabel}
                                      </p>
                                      <p className="text-[9px] text-neutral-400 font-mono mt-1">Ref: {p.transactionRef}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {tokenToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e2323] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-[#e0e3e2] dark:border-neutral-800">
            <div className="p-5 border-b border-[#e0e3e2] dark:border-neutral-800">
              <h3 className="text-lg font-bold text-[#98001b]">Delete Token</h3>
            </div>
            <div className="p-5">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Are you sure you want to permanently delete this token and all its payment history? This action cannot be undone.
              </p>
            </div>
            <div className="p-5 bg-neutral-50 dark:bg-neutral-800/50 border-t border-[#e0e3e2] dark:border-neutral-800 flex justify-end gap-3">
              <button
                onClick={() => setTokenToDelete(null)}
                className="px-4 py-2 text-sm font-bold text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-[#e0e3e2] dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteActiveProject?.(tokenToDelete);
                  setTokenToDelete(null);
                }}
                className="px-4 py-2 text-sm font-bold text-white bg-[#98001b] rounded-xl hover:bg-red-800 transition-colors shadow-lg shadow-red-900/20"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
