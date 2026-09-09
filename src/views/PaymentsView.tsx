import React, { useState, useMemo, useCallback } from 'react';
import { Wallet, Award, Receipt, Clock, PlusCircle, Upload, Eye, X, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Calendar, Ticket } from 'lucide-react';
import { PaymentRecord, PaymentStatus, UserActiveProject, WinnerRecord } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  activeProjects?: UserActiveProject[];
  winners?: WinnerRecord[];
  totalPaid: number;
  activeTokensCount: number;
  onOpenPaymentModal: (project?: string, amount?: number, label?: string, tokenNumber?: string) => void;
  currentLang?: LanguageType;
}

// ------------------------------------------------------------------
// Memoized Payment Row Card
// ------------------------------------------------------------------
interface PaymentCardProps {
  record: PaymentRecord;
  t: typeof TRANSLATIONS['ur'];
  onOpenPaymentModal: (project?: string, amount?: number, label?: string, tokenNumber?: string) => void;
  onViewSlip: (url: string, name: string) => void;
}

const PaymentCard = React.memo<PaymentCardProps>(({
  record,
  t,
  onOpenPaymentModal,
  onViewSlip
}) => {
  const isPending = record.status === 'PENDING' || record.status === 'UNDER_REVIEW';
  const isRejected = record.status === 'REJECTED';

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            <span>{t.statusApproved}</span>
          </span>
        );
      case 'UNDER_REVIEW':
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{t.statusPending}</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            <span>{t.statusRejected}</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`bg-white dark:bg-[#2d3131] rounded-2xl card-shadow border p-4 flex flex-col gap-3 relative overflow-hidden transition-all ${
        isPending
          ? 'border-[#98001b]/40 ring-1 ring-[#98001b]/20'
          : isRejected
          ? 'border-rose-200 dark:border-rose-900/50'
          : 'border-[#f1e2e1] dark:border-neutral-700'
      }`}
    >
      {/* Highlight bar for pending status */}
      {isPending && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#98001b]"></div>}

      {/* Header row */}
      <div className="flex justify-between items-start border-b border-[#e2e8f0] dark:border-neutral-700 pb-3 pl-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ffdad8] dark:bg-neutral-800 flex items-center justify-center shrink-0 text-[#98001b]">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3
              className={`font-headline font-bold text-xs sm:text-sm text-[#181c1c] dark:text-white ${
                isRejected ? 'line-through opacity-70' : ''
              }`}
            >
              {record.projectName}
            </h3>
            <p
              className={`text-xs mt-0.5 ${
                isPending
                  ? 'text-[#98001b] font-bold'
                  : isRejected
                  ? 'text-rose-600 font-semibold'
                  : 'text-[#5b403f] dark:text-neutral-400 font-medium'
              }`}
            >
              {record.installmentLabel}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div
            className={`font-headline font-black text-sm sm:text-base text-[#98001b] dark:text-[#ffb3b0] ${
              isRejected ? 'line-through text-[#8f6f6e]' : ''
            }`}
          >
            PKR {record.amount.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-[#5b403f] dark:text-neutral-400 mt-0.5 font-medium">
            {record.date}
          </div>
        </div>
      </div>

      {/* Footer row with status & actions */}
      <div className="flex justify-between items-center pt-0.5 pl-1">
        <div className="flex items-center gap-1.5 text-[#5b403f] dark:text-neutral-400 text-xs">
          <span className="font-mono text-[11px] bg-[#f8faf9] dark:bg-neutral-800 px-2 py-0.5 rounded border border-[#e2e8f0] dark:border-neutral-700 font-semibold">
            {record.transactionRef}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {record.receiptUrl && (
            <button
              type="button"
              onClick={() => onViewSlip(record.receiptUrl!, record.receiptFileName || `Receipt-${record.transactionRef}`)}
              className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title={t.viewSlip}
            >
              <Eye className="w-3 h-3 text-emerald-600" />
              <span>{t.viewSlip}</span>
            </button>
          )}

          {isPending && (
            <button
              onClick={() => onOpenPaymentModal(record.projectName, record.amount)}
              className="font-black text-xs text-[#98001b] hover:text-[#be1e2d] uppercase tracking-wider underline cursor-pointer"
            >
              {t.payNowBtn}
            </button>
          )}

          {isRejected && (
            <button
              onClick={() => onOpenPaymentModal(record.projectName, record.amount)}
              className="font-bold text-xs text-[#98001b] hover:text-[#be1e2d] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Re-upload</span>
            </button>
          )}

          {getStatusBadge(record.status)}
        </div>
      </div>
    </div>
  );
});

// ------------------------------------------------------------------
// Main Payments View Component
// ------------------------------------------------------------------
export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  activeProjects = [],
  winners = [],
  totalPaid,
  activeTokensCount,
  onOpenPaymentModal,
  currentLang = 'ur'
}) => {
  const t = TRANSLATIONS[currentLang];
  const [filter, setFilter] = useState<string>('all');
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [viewingSlipName, setViewingSlipName] = useState<string>('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const filteredPayments = useMemo(() => {
    return (payments || []).filter((p) => {
      if (filter === 'honda') return p.projectName.toLowerCase().includes('honda');
      if (filter === 'alto') return p.projectName.toLowerCase().includes('alto');
      if (filter === 'pending') return p.status === 'PENDING' || p.status === 'UNDER_REVIEW';
      return true;
    });
  }, [payments, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);

  const paginatedPayments = useMemo(() => {
    const start = (effectivePage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, effectivePage, pageSize]);

  const handleViewSlip = useCallback((url: string, name: string) => {
    setViewingSlipUrl(url);
    setViewingSlipName(name);
  }, []);

  return (
    <div className="space-y-5 px-4 py-5 animate-in fade-in duration-300 pb-10">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline font-black text-2xl text-[#98001b] dark:text-[#ffb3b0]">
            {t.paymentsLedger}
          </h1>
          <p className="text-xs text-[#5b403f] dark:text-neutral-400 font-medium">
            {t.paymentsSub}
          </p>
        </div>

        <button
          id="btn-new-payment"
          onClick={() => onOpenPaymentModal()}
          className="gold-gradient text-[#785a1a] font-black text-xs px-4 py-2.5 rounded-full shadow-gold hover:opacity-95 flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-95 transition-all touch-target"
        >
          <PlusCircle className="w-4 h-4 text-[#98001b]" />
          <span>{t.payNowBtn}</span>
        </button>
      </div>

      {/* Per Token Payment Details (Ledger Cards) */}
      {(activeProjects || []).length > 0 && (
        <div className="space-y-3">
          {(activeProjects || []).map((project) => {
            // Calculate stats for this specific token
            const projectPayments = (payments || []).filter(p => p.userToken === project.ticketNumber);
            const paidPayments = projectPayments.filter(p => p.status === 'PAID');
            const totalAmountPaidForToken = paidPayments.reduce((sum, p) => sum + p.amount, 0);
            
            const is36Months = project.totalUnits === 36;
            const totalExpectedUnits = project.totalUnits || 1;
            
            // Check if this token is a winner
            // Usually we'd match on ticketNumber too, but let's match on project title and user context
            // if winners array is global, we need to match user. We assume the activeProjects are already filtered for the current user.
            const hasWon = (winners || []).some(w => w.prizeWon.includes(project.projectTitle) && (w.name === project.userName || w.prizeWon.includes(project.ticketNumber)));
            
            let remainingUnits = Math.max(0, totalExpectedUnits - paidPayments.length);
            
            if (hasWon && is36Months) {
              remainingUnits = 0; // Waived off!
            }

            return (
              <div key={project.id} className="bg-white dark:bg-[#2d3131] rounded-3xl p-4 border border-[#e0e3e2] dark:border-neutral-700 shadow-sm relative overflow-hidden">
                {hasWon && is36Months && (
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                )}
                
                <div className="flex justify-between items-start border-b border-[#f1e2e1] dark:border-neutral-700 pb-3 mb-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#181c1c] dark:text-white uppercase">
                      {project.projectTitle}
                    </h4>
                    <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded font-mono font-bold mt-1 inline-block">
                      {project.ticketNumber}
                    </span>
                  </div>
                  {is36Months && hasWon ? (
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                      <Award className="w-3.5 h-3.5" />
                      Winner (Installments Waived)
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-500 uppercase font-bold">Plan</p>
                      <p className="text-xs font-black text-[#98001b] dark:text-rose-400">{project.projectType}</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#f8faf9] dark:bg-neutral-800 p-2.5 rounded-xl border border-[#e2e8f0] dark:border-neutral-700 text-center">
                    <p className="text-[9px] text-neutral-500 uppercase font-bold mb-0.5">Total Paid</p>
                    <p className="text-xs font-black text-[#181c1c] dark:text-white">PKR {totalAmountPaidForToken.toLocaleString()}</p>
                  </div>
                  <div className="bg-[#f8faf9] dark:bg-neutral-800 p-2.5 rounded-xl border border-[#e2e8f0] dark:border-neutral-700 text-center">
                    <p className="text-[9px] text-neutral-500 uppercase font-bold mb-0.5">Installments Paid</p>
                    <p className="text-xs font-black text-emerald-600">{paidPayments.length} <span className="text-[9px] text-neutral-500">/ {totalExpectedUnits}</span></p>
                  </div>
                  <div className={`p-2.5 rounded-xl border text-center ${remainingUnits === 0 ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200' : 'bg-[#fff5f5] dark:bg-rose-950/20 border-rose-100'}`}>
                    <p className="text-[9px] text-neutral-500 uppercase font-bold mb-0.5">Remaining</p>
                    <p className={`text-xs font-black ${remainingUnits === 0 ? 'text-emerald-600' : 'text-[#98001b]'}`}>
                      {remainingUnits === 0 ? 'NIL (0)' : `${remainingUnits} Left`}
                    </p>
                  </div>
                </div>

                {hasWon && is36Months && (
                  <div className="mt-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-2.5 rounded-xl flex items-start gap-2">
                    <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-urdu font-bold leading-relaxed">
                      آپ کا ٹوکن لکی ڈرا میں نکل گیا ہے لہذا آپ کی اگلی تمام اقساط ختم ہو گئی ہیں!
                    </p>
                  </div>
                )}

                {remainingUnits > 0 && !hasWon && (
                  <button
                    onClick={() => onOpenPaymentModal(project.projectTitle, project.monthlyKist || project.tokenAmount, undefined, project.ticketNumber)}
                    className="w-full mt-3 bg-white dark:bg-neutral-800 border border-[#e2e8f0] dark:border-neutral-700 hover:bg-neutral-50 text-xs font-bold py-2 rounded-xl text-[#181c1c] dark:text-white flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4 text-[#98001b]" />
                    {is36Months ? 'Pay Next Installment' : 'Pay Token Amount'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex justify-between items-center mt-6">
        <h3 className="font-bold text-sm text-[#181c1c] dark:text-white uppercase tracking-wider">
          Payment History
        </h3>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        <button
          onClick={() => {
            setFilter('all');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#98001b] text-white shadow-maroon'
              : 'bg-white dark:bg-neutral-800 text-[#181c1c] dark:text-white border border-[#e2e8f0] dark:border-neutral-700'
          }`}
        >
          {t.allPaymentsFilter} ({(payments || []).length})
        </button>
        <button
          onClick={() => {
            setFilter('pending');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            filter === 'pending'
              ? 'bg-[#98001b] text-white shadow-maroon'
              : 'bg-white dark:bg-neutral-800 text-[#181c1c] dark:text-white border border-[#e2e8f0] dark:border-neutral-700'
          }`}
        >
          {t.statusPending}
        </button>
      </div>

      {/* Payments List */}
      <div className="space-y-3">
        {paginatedPayments.map((record) => (
          <PaymentCard
            key={record.id}
            record={record}
            t={t}
            onOpenPaymentModal={onOpenPaymentModal}
            onViewSlip={handleViewSlip}
          />
        ))}

        {filteredPayments.length === 0 && (
          <div className="p-8 text-center text-neutral-500 font-urdu bg-white dark:bg-[#2d3131] rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 card-shadow">
            کوئی ادائیگی ریکارڈ نہیں ملا۔
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredPayments.length > pageSize && (
        <div className="p-3.5 bg-white dark:bg-[#2d3131] rounded-2xl border border-[#e2e8f0] dark:border-neutral-700 flex items-center justify-between text-xs card-shadow">
          <span className="text-neutral-500 font-medium">
            Showing {(effectivePage - 1) * pageSize + 1}-{Math.min(effectivePage * pageSize, filteredPayments.length)} of {filteredPayments.length}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={effectivePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-neutral-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold px-3 py-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              {effectivePage}/{totalPages}
            </span>
            <button
              type="button"
              disabled={effectivePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl border border-neutral-300 dark:border-neutral-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:bg-neutral-100"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* FULL IMAGE PREVIEW MODAL */}
      {viewingSlipUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingSlipUrl(null)}
        >
          <div className="relative max-w-lg w-full bg-white dark:bg-[#2d3131] rounded-3xl overflow-hidden shadow-2xl p-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                {viewingSlipName || 'Payment Screenshot / Slip'}
              </span>
              <button
                onClick={() => setViewingSlipUrl(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 flex items-center justify-center cursor-pointer text-neutral-700 dark:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-2 mt-3 bg-neutral-100 dark:bg-neutral-900 rounded-2xl">
              <img
                src={viewingSlipUrl}
                alt="Payment Receipt"
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-[65vh] object-contain rounded-xl shadow"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

