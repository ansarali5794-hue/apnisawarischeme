import React, { useState, useMemo, useCallback } from 'react';
import { Wallet, Award, Receipt, Clock, PlusCircle, Upload, Eye, X, Image as ImageIcon, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Calendar, Ticket, Download } from 'lucide-react';
import { PaymentRecord, PaymentStatus, UserActiveProject, WinnerRecord } from '../types';
import { LanguageType, TRANSLATIONS } from '../lib/translations';
import { OfficialReceiptModal } from '../components/OfficialReceiptModal';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  activeProjects?: UserActiveProject[];
  winners?: WinnerRecord[];
  totalPaid: number;
  activeTokensCount: number;
  onOpenPaymentModal: (project?: string, amount?: number, label?: string, tokenNumber?: string) => void;
  currentLang?: LanguageType;
  userName?: string;
}

// ------------------------------------------------------------------
// Memoized Payment Row Card
// ------------------------------------------------------------------
interface PaymentCardProps {
  record: PaymentRecord;
  t: typeof TRANSLATIONS['ur'];
  onOpenPaymentModal: (project?: string, amount?: number, label?: string, tokenNumber?: string) => void;
  onViewSlip: (url: string, name: string) => void;
  onDownloadReceipt: (record: PaymentRecord) => void;
}

const PaymentCard = React.memo<PaymentCardProps>(({
  record,
  t,
  onOpenPaymentModal,
  onViewSlip,
  onDownloadReceipt
}) => {
  const isPending = record.status === 'PENDING' || record.status === 'UNDER_REVIEW';
  const isRejected = record.status === 'REJECTED';
  const isPaid = record.status === 'PAID';

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
          {isPaid ? (
            <button
              type="button"
              onClick={() => onDownloadReceipt(record)}
              className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Official Receipt"
            >
              <Download className="w-3 h-3 text-emerald-600" />
              <span>Receipt</span>
            </button>
          ) : record.receiptUrl ? (
            <button
              type="button"
              onClick={() => onViewSlip(record.receiptUrl!, record.receiptFileName || `Receipt-${record.transactionRef}`)}
              className="px-2.5 py-1 rounded-full bg-[#f8faf9] hover:bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title={t.viewSlip}
            >
              <Eye className="w-3 h-3 text-neutral-500" />
              <span>{t.viewSlip}</span>
            </button>
          ) : null}

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
  currentLang = 'ur',
  userName
}) => {
  const t = TRANSLATIONS[currentLang];
  const [filter, setFilter] = useState<string>('all');
  const [viewingSlipUrl, setViewingSlipUrl] = useState<string | null>(null);
  const [viewingSlipName, setViewingSlipName] = useState<string>('');
  
  // Official Receipt Modal State
  const [receiptModalRecord, setReceiptModalRecord] = useState<PaymentRecord | null>(null);

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

  const handleDownloadReceipt = useCallback((record: PaymentRecord) => {
    setReceiptModalRecord(record);
  }, []);

  return (
    <div className="space-y-5 px-4 py-5 animate-in fade-in duration-300 pb-10">
      {/* Header Section */}
      <div className="flex justify-between items-center border-b border-[#f1e2e1] dark:border-neutral-700 pb-4">
        <div>
          <h1 className="font-headline font-black text-2xl text-[#98001b] dark:text-[#ffb3b0] flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            Passbook & Receipts
          </h1>
          <p className="text-xs text-[#5b403f] dark:text-neutral-400 font-medium mt-1">
            Track all your past payments, verify statuses, and download official receipts.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
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
            onDownloadReceipt={handleDownloadReceipt}
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

      {/* Official Receipt Modal */}
      {receiptModalRecord && (
        <OfficialReceiptModal
          isOpen={true}
          onClose={() => setReceiptModalRecord(null)}
          record={receiptModalRecord}
          userName={userName || (activeProjects && activeProjects.length > 0 ? activeProjects[0].userName : 'Customer')}
        />
      )}
    </div>
  );
};

